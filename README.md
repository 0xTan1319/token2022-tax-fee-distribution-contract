# Token2022 Token Distribution Contract

Reward distribution contract in token 2022 reward - Token2022 tokens for block miners

## Install Dependencies

- Install `node` and `yarn`
- Confirm the solana wallet preparation: `/root/fury/devnet.json` in test case
- Need to have one more wallet for admin: `/root/fury/deploy-231218.json` in test case

## Usage

- Run any commands by cli from: `/cli/command.ts`
- Main script source for all functionalities are here: `/cli/scripts.ts`
- Web3 library for all instructions of the program: `/cli/lib.ts`
- Program account types are declared here: `/cli/types.ts`
- Idl to make the web3 binding easy is here: `/cli/distribution.json`, `/cli/distribution.ts`

- Without the admin & caller wallet, you can only test the status commands
- Run `yarn ts-node <command>` to try caller functions
- Run `yarn ts-node-admin <command>` to try admin functions
- All status check commands are working both of scripts

## Features

### As a Smart Contract Owner

For the first time use, the Smart Contract Owner should `init_global` the Smart Contract for global account allocation. \
\*\* This command will be config the immutable admin address from the payer wallet

- `init_global --caller <caller address> --start_block <starting blocknumber>`

Everyone can check the global configs by `global_status` command at any time

- `global_status`

Admin able to change the caller address by `update_caller` command

- `update_caller --caller <new caller address>`

### As a Caller

The caller able to distribute reward to a block mining winner for a specific block. \
Not allowed to reward for same block number & before 5 mins since previous distribution.

### Guest

Everyone able to check global configs by `global_status` command.
Same as for admin.

- `global_status`

Also able to check any mined block reward info by `mined_block` command.

- `mined_block --block_number <number>`

More useful command to fetch all reward distribution info is `get_all_blocks` command. \
This command will fetch all MinedInfo PDAs and parse the reward info.

- `get_all_blocks`

## Importants

This program is for community backend system. Able to use for only admin & caller. \
There are a few key points which should not forget.

- You should check the Reward token Mint and initial reward amount in the token decimal
- You should keep in mind that the reward will be halved for each 69420 blocks. \
  Also the reward will be zero if the reward token supply reachs to 21 millions.
- This program Global PDA should have the Mint Authority of the reward token. \
  After `init_global`, you can check the globalAuthority PDA address by running \
  `yarn ts-node global_status` command. \
**``` globalAuthority= CPwQXWiHNiXsXoCeUPd3oxJ9fVN2ya6avTXV7wHefaLS ```** \
  This command will log the Global PDA address in this format.
  Admin should transfer the **MintAuthority** of the reward token to this PDA.
