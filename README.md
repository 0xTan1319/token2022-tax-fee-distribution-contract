# NFT_Upgrading
BTC Mining NFT Upgrade program for occasionally succeed in rolling for upgrade

## Install Dependencies
- Install `node` and `yarn`
- Install `ts-node` as global command
- Confirm the solana wallet preparation: `/home/fury/.config/solana/id.json` in test case

## Usage
- Main script source for all functionality is here: `/cli/scripts.ts`
- Program account types are declared here: `/cli/types.ts`
- Idl to make the JS binding easy is here: `/cli/.json`

Able to test the script functions working in this way.
- Change commands properly in the main functions of the `scripts.ts` file to call the other functions
- Confirm the `ANCHOR_WALLET` environment variable of the `ts-node` script in `package.json`
- Run `yarn ts-node`

## Features

### As a Smart Contract Owner
For the first time use, the Smart Contract Owner should `initialize` the Smart Contract for global account allocation.
- `initProject`
 
Recall `initialize` function for update the Threshold values after change the constants properly
- `initProject` \
