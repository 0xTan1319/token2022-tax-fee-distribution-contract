import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface GlobalInfo {
  // 8 + 96
  admin: PublicKey; // 32
  caller: PublicKey; // 32
  currentReward: anchor.BN; // 8
  halvedTimes: anchor.BN; // 8
  lastHalvedBlockNumber: anchor.BN; // 8
  lastMineTime: anchor.BN; // 8
}

export interface MinedInfo {
  // 8 + 56
  winnerAddress: PublicKey; // 32
  blockNumber: anchor.BN; // 8
  rewardSent: anchor.BN; // 8
  timeStamp: anchor.BN; // 8
}

export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const MINED_INFO_SEED = "mined-info";
export const MINED_INFO_SIZE = 64;
