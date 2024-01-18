import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";

import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

import {
  GLOBAL_AUTHORITY_SEED,
  GlobalInfo,
  MINED_INFO_SEED,
  MINED_INFO_SIZE,
  MinedInfo,
} from "./types";
import { REWARD_TOKEN_MINT, PROGRAM_ID } from "./config";
import { getAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "./utils";

/// Create instruction to initialize global PDA as admin
export const initProjectIx = async (
  payer: PublicKey,
  callerWallet: PublicKey,
  startingBlock: number,
  program: Program
) => {
  const globalAuthority = await getGlobalKey();

  const ix = await program.methods
    .initialize(payer, callerWallet, new anchor.BN(startingBlock))
    .accounts({
      admin: payer,
      globalAuthority,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  return ix;
};

/// Create instruction to update caller address as admin
export const updateCallerAddressIx = async (
  payer: PublicKey,
  newCaller: PublicKey,
  program: Program
) => {
  const globalAuthority = await getGlobalKey();

  const ix = await program.methods
    .updateCallerAddress(newCaller)
    .accounts({
      admin: payer,
      globalAuthority,
    })
    .instruction();
  return ix;
};

/// Create instruction to distribute reward for won miner as caller
export const mineBlockIx = async (
  payer: PublicKey,
  winner: PublicKey,
  blockNumber: number,
  program: Program,
  connection: Connection
) => {
  const globalAuthority = await getGlobalKey();
  console.log("Global Authority:", globalAuthority.toBase58());

  const minedInfoKey = await getMinedInfoKey(blockNumber);
  console.log("Mined Info: ", minedInfoKey.toBase58());

  const userTokenAccount = await getAssociatedTokenAccount(
    winner,
    REWARD_TOKEN_MINT
  );
  console.log("userNftTokenAccount", userTokenAccount.toBase58());

  let ixs = [];

  /// Check user ATA and add create Ix if not initialized yet
  const ataInfo = await connection.getAccountInfo(userTokenAccount);
  if (!ataInfo?.owner || ataInfo.owner.equals(PublicKey.default)) {
    console.log("Adding ATA creation ix..");
    ixs.push(
      createAssociatedTokenAccountInstruction(
        payer,
        userTokenAccount,
        winner,
        REWARD_TOKEN_MINT,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  ixs.push(
    await program.methods
      .mineBlock(new anchor.BN(blockNumber))
      .accounts({
        caller: payer,
        globalAuthority,
        minedInfo: minedInfoKey,
        winner,
        tokenMint: REWARD_TOKEN_MINT,
        userTokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction()
  );

  return ixs;
};

/// Get Global PDA address
export const getGlobalKey = async (): Promise<PublicKey> => {
  const [globalAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    PROGRAM_ID
  );
  return globalAuthority;
};

/// Get Global PDA state
export const getGlobalState = async (
  program: Program
): Promise<GlobalInfo | null> => {
  const globalAuthority = await getGlobalKey();
  console.log("globalAuthority=", globalAuthority.toBase58());

  try {
    const globalState = await program.account.globalInfo.fetch(globalAuthority);
    return globalState as unknown as GlobalInfo;
  } catch {
    return null;
  }
};

/// Get MinedInfo PDA address for a specific block number
export const getMinedInfoKey = async (
  blockNumber: number
): Promise<PublicKey> => {
  const [minedInfoKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from(MINED_INFO_SEED),
      new anchor.BN(blockNumber).toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );

  return minedInfoKey;
};

/// Get MinedInfo PDA state for a specific block number
export const getMinedInfoState = async (
  blockNumber: number,
  program: Program
): Promise<MinedInfo | null> => {
  const minedInfoKey = await getMinedInfoKey(blockNumber);
  console.log("Mined Info: ", minedInfoKey.toBase58());

  try {
    const poolState = await program.account.upgradeTier.fetch(minedInfoKey);
    return poolState as unknown as MinedInfo;
  } catch {
    return null;
  }
};

/// Find all MinedInfo PDAs and parse states
export const getAllMinedInfoAccounts = async (
  program: Program,
  connection: Connection
) => {
  console.log("Fetching all MinedInfo PDAs..");
  const pdas = await connection.getProgramAccounts(program.programId, {
    filters: [
      {
        dataSize: MINED_INFO_SIZE,
      },
    ],
  });
  console.log(`Found ${pdas.length} accounts`);

  let result: MinedInfo[] = [];
  for (let pda of pdas) {
    const minedInfo = program.coder.accounts.decode(
      "MinedInfo",
      pda.account.data
    );
    result.push(minedInfo as MinedInfo);
  }

  return result;
};
