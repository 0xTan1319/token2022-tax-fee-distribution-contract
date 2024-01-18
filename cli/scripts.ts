import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";

import { PublicKey, Transaction } from "@solana/web3.js";
import fs from "fs";

import { GlobalInfo, MinedInfo } from "./types";
import { PROGRAM_ID, solanaRPC } from "./config";
import {
  initProjectIx,
  updateCallerAddressIx,
  mineBlockIx,
  getGlobalState,
  getMinedInfoState,
  getAllMinedInfoAccounts,
} from "./lib";

let program: Program = null;
let provider: anchor.Provider = null;
let payer;

const idl = JSON.parse(
  fs.readFileSync(__dirname + "/../target/idl/distribution.json", "utf8")
);

anchor.setProvider(anchor.AnchorProvider.local(solanaRPC));
provider = anchor.getProvider();
const solConnection = anchor.getProvider().connection;
payer = anchor.AnchorProvider.local().wallet;

// Generate the program client from IDL.
program = new anchor.Program(idl, PROGRAM_ID);
console.log("programId: ", PROGRAM_ID.toBase58());

export const initProject = async (
  callerWallet: PublicKey,
  startingBlock: number
) => {
  const ix = await initProjectIx(
    payer.publicKey,
    callerWallet,
    startingBlock,
    program
  );
  const tx = new Transaction().add(ix);

  const { blockhash } = await solConnection.getLatestBlockhash("confirmed");
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = blockhash;

  const signedTx = await payer.signTransaction(tx);
  const txHash = await solConnection.sendEncodedTransaction(
    signedTx.serialize().toString("base64")
  );
  // const txHash = await solConnection.sendTransaction(tx, [
  //   (payer as unknown as NodeWallet).payer,
  // ]);

  await solConnection.confirmTransaction(txHash, "confirmed");

  console.log("txHash =", txHash);
};

export const updateCaller = async (newCaller: PublicKey) => {
  const ix = await updateCallerAddressIx(payer.publicKey, newCaller, program);
  const tx = new Transaction().add(ix);

  const { blockhash } = await solConnection.getLatestBlockhash("confirmed");
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = blockhash;

  const signedTx = await payer.signTransaction(tx);
  const txHash = await solConnection.sendEncodedTransaction(
    signedTx.serialize().toString("base64")
  );

  await solConnection.confirmTransaction(txHash, "confirmed");

  console.log("txHash =", txHash);
};

export const mineBlock = async (winner: PublicKey, blockNumber: number) => {
  const ixs = await mineBlockIx(
    payer.publicKey,
    winner,
    blockNumber,
    program,
    solConnection
  );
  const tx = new Transaction().add(...ixs);

  const { blockhash } = await solConnection.getLatestBlockhash("confirmed");
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = blockhash;

  const signedTx = await payer.signTransaction(tx);

  console.log(await solConnection.simulateTransaction(signedTx));

  const txHash = await solConnection.sendEncodedTransaction(
    signedTx.serialize().toString("base64")
  );

  await solConnection.confirmTransaction(txHash, "confirmed");

  console.log("txHash =", txHash);
};

export const getGlobalData = async () => {
  const globalPool: GlobalInfo = await getGlobalState(program);
  return {
    admin: globalPool.admin.toBase58(),
    caller: globalPool.caller.toBase58(),
    currentReward: globalPool.currentReward.toNumber(),
    halvedTimes: globalPool.halvedTimes.toNumber(),
    lastHalvedBlockNumber: globalPool.lastHalvedBlockNumber.toNumber(),
    lastMineTime: globalPool.lastMineTime.toNumber(),
  };
};

export const getMinedInfoData = async (blockNumber: number) => {
  const minedInfo: MinedInfo = await getMinedInfoState(blockNumber, program);
  return {
    winnerAddress: minedInfo.winnerAddress.toBase58(),
    blockNumber: minedInfo.blockNumber.toNumber(),
    rewardSent: minedInfo.rewardSent.toNumber(),
    timeStamp: minedInfo.timeStamp.toNumber(),
  };
};

export const getAllMinedInfo = async () => {
  const states = await getAllMinedInfoAccounts(program, solConnection);
  return states.map((state) => {
    return {
      winnerAddress: state.winnerAddress.toBase58(),
      blockNumber: state.blockNumber.toNumber(),
      rewardSent: state.rewardSent.toNumber(),
      timeStamp: state.timeStamp.toNumber(),
    };
  });
};
