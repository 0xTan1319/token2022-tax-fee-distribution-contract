use anchor_lang::prelude::*;

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::{self, MintTo};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

pub mod account;
pub mod constants;
pub mod error;

use account::*;
use constants::*;
use error::*;

declare_id!("2YkXmCtRc6BzST3eavg7pxnYRJmoMBXEB8pzDN77wuhN");

#[program]
pub mod distribution {

    use super::*;

    /**
     * Admin should initialize Global PDA once after deploy program
     *
     * Params:
     *  - admin_wallet: the contract immutable admin address
     *  - caller_wallet: initial caller address who has the rights for reward
     *    distribution
     *  - staring_block: this contract will be distribute reward for blocks
     *    since after `starting_block`
     */
    pub fn initialize(
        ctx: Context<Initialize>,
        admin_wallet: Pubkey,
        caller_wallet: Pubkey,
        starting_block: u64,
    ) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;

        global_authority.admin = admin_wallet;
        global_authority.caller = caller_wallet;
        global_authority.current_reward = INITIAL_REWARD;
        global_authority.halved_times = 0;
        // Reward can be distribute since starting block
        global_authority.last_halved_block_number = starting_block;
        global_authority.last_mine_time = 0;

        Ok(())
    }

    /**
     * Admin able to update the caller address
     *
     * Params:
     *  - new_caller: the new caller address
     */
    pub fn update_caller_address(ctx: Context<UpdateCaller>, new_caller: Pubkey) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;

        // Validate payer is admin
        require!(
            ctx.accounts.admin.key().eq(&global_authority.admin),
            DistributionError::InvalidAdmin
        );
        global_authority.caller = new_caller;

        Ok(())
    }

    /**
     * Caller distribute reward to won miner for a specific block number
     *
     * Params:
     *  - block_number: the number of mined block
     */
    pub fn mine_block(ctx: Context<MineBlock>, block_number: u64) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        let mined_info = &mut ctx.accounts.mined_info;
        let address = ctx.accounts.winner.key();

        // Validate payer is caller
        require!(
            ctx.accounts.caller.key().eq(&global_authority.caller),
            DistributionError::InvalidCaller
        );

        let now_time_stamp = Clock::get()?.unix_timestamp;
        // Minimum next block mining time should be more than 5 mins
        require!(
            (now_time_stamp - global_authority.last_mine_time) >= MIN_BLOCK_MINING_TIME,
            DistributionError::InvalidMiningTime
        );
        // Block number input should be future time than last_halved_block
        // This will check starting block too
        require!(
            block_number > global_authority.last_halved_block_number,
            DistributionError::InvalidBlockNumber
        );

        // Reward will be halved each 69420 blocks. Maximum 6 times
        if global_authority.halved_times < MAX_HALVE_TIMES {
            let mut halve_times =
                (block_number - global_authority.last_halved_block_number) / HALVED_BLOCK_COUNT;

            if halve_times > MAX_HALVE_TIMES - global_authority.halved_times {
                halve_times = MAX_HALVE_TIMES - global_authority.halved_times;
            }

            global_authority.last_halved_block_number =
                halve_times * HALVED_BLOCK_COUNT + global_authority.last_halved_block_number;
            global_authority.halved_times += halve_times;

            for _idx in 0..halve_times {
                global_authority.current_reward /= 2;
            }
        }

        let mut reward = global_authority.current_reward;
        let supply = ctx.accounts.token_mint.supply;
        // If reward token supply reach to maximum of tokenomics
        // Reward will be zero
        if supply == MAX_SUPPLY {
            reward = 0;
        } else if supply + reward > MAX_SUPPLY {
            reward = MAX_SUPPLY - supply;
        }

        let token_account_info = &mut &ctx.accounts.user_token_account;

        // Global authority should have the reward token mint authority
        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info().clone(),
            to: token_account_info.to_account_info().clone(),
            authority: global_authority.to_account_info().clone(),
        };

        let token_program = &mut &ctx.accounts.token_program;
        let global_bump = *ctx.bumps.get("global_authority").unwrap();
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        token_2022::mint_to(
            CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer),
            reward,
        )?;

        // Save new reward info in MinedInfo PDA
        mined_info.winner_address = address;
        mined_info.block_number = block_number;
        mined_info.reward_sent = reward;
        mined_info.time_stamp = now_time_stamp;

        // Update last reward time of Global PDA
        global_authority.last_mine_time = now_time_stamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin,
        space = 8 + GlobalInfo::LEN
    )]
    pub global_authority: Account<'info, GlobalInfo>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCaller<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_authority: Account<'info, GlobalInfo>,
}

#[derive(Accounts)]
#[instruction(
    block_number: u64,
)]
pub struct MineBlock<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_authority: Account<'info, GlobalInfo>,
    #[account(
        init,
        seeds = [MINED_INFO_SEED.as_ref(), block_number.to_le_bytes().as_ref()],
        bump,
        payer = caller,
        space = 8 + MinedInfo::LEN,
    )]
    pub mined_info: Account<'info, MinedInfo>,

    pub winner: SystemAccount<'info>,
    #[account(
        mut,
        address = REWARD_TOKEN_MINT.parse::<Pubkey>().unwrap()
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    // User ATA should be initialized if not created yet
    // This will be proceed in web3 side by Token2022 program
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        address = token_2022::ID,
    )]
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
