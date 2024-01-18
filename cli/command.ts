#!/usr/bin/env ts-node
import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import {
  getGlobalData,
  getMinedInfoData,
  initProject,
  updateCaller,
  mineBlock,
  getAllMinedInfo,
} from "./scripts";

program.version("0.0.1");

/// Check status of PDAs

programCommand("global_status")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Get Distribution Program Global PDA Info\n`)
  .action(async (directory, cmd) => {
    console.log("globalInfo =", await getGlobalData());
  });

programCommand("mined_block")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Get mined block info`)
  .requiredOption(
    "-n, --block_number <number>",
    "The block number of mined info"
  )
  .action(async (directory, cmd) => {
    const { blockNumber } = cmd.opts();

    console.log(
      `blockNumber ${blockNumber}=`,
      await getMinedInfoData(parseInt(blockNumber))
    );
  });

programCommand("get_all_blocks")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Get all mined blocks info`)
  .action(async (directory, cmd) => {
    console.log(await getAllMinedInfo());
  });

/// Config global settings as Admin

programCommand("init_global")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Initialize Global PDA of contract`)
  .requiredOption("-c, --caller <string>", "The caller address")
  .requiredOption(
    "-s, --start_block <number>",
    "The block number of distribution start"
  )
  .action(async (directory, cmd) => {
    const { start_block, caller } = cmd.opts();
    await initProject(new PublicKey(caller), parseInt(start_block));
  });

programCommand("update_caller")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Update Global PDA for new caller address`)
  .requiredOption("-c, --caller <string>", "The caller address")
  .action(async (directory, cmd) => {
    const { caller } = cmd.opts();
    await updateCaller(new PublicKey(caller));
  });

/// Caller Actions

programCommand("mine_block")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(`Try to distribute reward to winner`)
  .requiredOption("-b, --block_number <number>", "The mined block number")
  .requiredOption("-w, --winner <string>", "The mining winner address")
  .action(async (directory, cmd) => {
    const { block_number, winner } = cmd.opts();

    await mineBlock(new PublicKey(winner), parseInt(block_number));
  });

function programCommand(name: string) {
  return program.command(name);
}

program.parse(process.argv);
