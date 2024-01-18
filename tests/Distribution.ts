// import * as anchor from '@project-serum/anchor';
// import { Program } from '@project-serum/anchor';
// import { 
//   PublicKey,
//   SystemProgram,
//   SYSVAR_RENT_PUBKEY,
// } from '@solana/web3.js';
// import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import fs from 'fs';

// import { Distribution } from '../target/types/distribution';

// const GLOBAL_AUTHORITY_SEED = "global-authority";
// const REWARD_TOKEN_MINT = new PublicKey("8EoML7gaBJsgJtepm25wq3GuUCqLYHBoqd3HP1JxtyBx");
// const USER_POOL_SIZE = 5688;     // 8 + 5680
// // Configure the client to use the local cluster.
// const provider = anchor.AnchorProvider.env();
// anchor.setProvider(provider);

// describe('Distribution', async () => {
//   // const payer = provider.wallet;
//   // console.log('Payer: ', payer.publicKey.toBase58());
  
//   const program = anchor.workspace.MiningPowerUpgrade as Program<Distribution>;
//   console.log('ProgramId: ', program.programId.toBase58());

//   let rawdata = fs.readFileSync('tests/keys/reward_mint.json');
//   let keyData = JSON.parse(rawdata.toString());
//   let reward = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));

//   rawdata = fs.readFileSync('/home/ubuntu/fury/deploy-keypair.json');
//   keyData = JSON.parse(rawdata.toString());

//   const superOwner = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
//   const user = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
  
//   console.log('Reward Token: ', reward.publicKey.toBase58());
//   const rewardToken = new Token(
//     provider.connection,
//     REWARD_TOKEN_MINT,
//     TOKEN_PROGRAM_ID,
//     superOwner,
//   )

//   const [globalAuthority, bump] = await PublicKey.findProgramAddress(
//     [Buffer.from(GLOBAL_AUTHORITY_SEED)],
//     program.programId
//   );
//   console.log('GlobalAuthority: ', globalAuthority.toBase58());

//   const rewardVault = await getAssociatedTokenAccount(globalAuthority, REWARD_TOKEN_MINT);
//   console.log('RewardVault: ', rewardVault.toBase58());

//   let nft_token_mint = null;
//   let userTokenAccount = null;
//   let userRewardAccount = null;

//   it('Is initialized!', async () => {
    
//     // Add your test here.
//     await provider.connection.confirmTransaction(
//       await provider.connection.requestAirdrop(superOwner.publicKey, 1000000000),
//       "confirmed"
//     );
//     await provider.connection.confirmTransaction(
//       await provider.connection.requestAirdrop(user.publicKey, 1000000000),
//       "confirmed"
//     );
    
//     console.log("super owner =", superOwner.publicKey.toBase58());
//     console.log("user =", user.publicKey.toBase58());

//     const [globalAuthority, bump] = await PublicKey.findProgramAddress(
//       [Buffer.from(GLOBAL_AUTHORITY_SEED)],
//       program.programId
//     );

//     // Allocate memory for the account
//     const balanceNeeded = await Token.getMinBalanceRentForExemptMint(
//       provider.connection,
//     );
//     const transaction = new anchor.web3.Transaction();
//     transaction.add(
//         anchor.web3.SystemProgram.createAccount({
//             fromPubkey: superOwner.publicKey,
//             newAccountPubkey: REWARD_TOKEN_MINT,
//             lamports: balanceNeeded,
//             space: MintLayout.span,
//             programId: TOKEN_PROGRAM_ID,
//         }),
//     );
//     transaction.add(
//         Token.createInitMintInstruction(
//             TOKEN_PROGRAM_ID,
//             REWARD_TOKEN_MINT,
//             9,
//             superOwner.publicKey,
//             superOwner.publicKey,
//         ),
//     );
//     transaction.add(
//       Token.createAssociatedTokenAccountInstruction(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         REWARD_TOKEN_MINT,
//         rewardVault,
//         globalAuthority,
//         superOwner.publicKey,
//       ),
//     );
//     const txId = await provider.send(transaction, [reward]);
//     await provider.connection.confirmTransaction(txId);

//     await rewardToken.mintTo(
//       rewardVault,
//       superOwner,
//       [],
//       10_000_000_000
//     );
//     console.log(await provider.connection.getTokenAccountBalance(rewardVault));

//     const tx = await program.rpc.initialize(
//       bump, {
//         accounts: {
//           admin: superOwner.publicKey,
//           globalAuthority,
//           rewardVault: rewardVault,
//           systemProgram: SystemProgram.programId,
//           rent: SYSVAR_RENT_PUBKEY,
//         },
//         signers: [superOwner],
//       });
//     console.log("Your transaction signature", tx);
//     let globalPool = await program.account.globalPool.fetch(globalAuthority);
//     console.log("globalPool =", globalPool);
//   });

//   it('Initialize user pool', async () => {
//     let userPoolKey = await PublicKey.createWithSeed(
//       user.publicKey,
//       "user-pool",
//       program.programId,
//     );
//     console.log(USER_POOL_SIZE);
//     let ix = SystemProgram.createAccountWithSeed({
//       fromPubkey: user.publicKey,
//       basePubkey: user.publicKey,
//       seed: "user-pool",
//       newAccountPubkey: userPoolKey,
//       lamports : await provider.connection.getMinimumBalanceForRentExemption(USER_POOL_SIZE),
//       space: USER_POOL_SIZE,
//       programId: program.programId,
//     });
    
//     const tx = await program.rpc.initializeUserPool(
//       {
//         accounts: {
//           userPool: userPoolKey,
//           owner: user.publicKey
//         },
//         instructions: [
//           ix
//         ],
//         signers: [user]
//       }
//     );

//     console.log("Your transaction signature", tx);
//     let poolAccount = await program.account.userPool.fetch(userPoolKey);
//     console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
//   });

//   it('Stake NFT to user pool', async () => {
//     // Mint one Mining NFT for user
//     nft_token_mint = await Token.createMint(
//       provider.connection,
//       user,
//       superOwner.publicKey,
//       null,
//       0,
//       TOKEN_PROGRAM_ID
//     );
//     userTokenAccount = await nft_token_mint.createAccount(user.publicKey);
//     await nft_token_mint.mintTo(
//       userTokenAccount,
//       superOwner,
//       [],
//       1
//     );
//     console.log("Mining NFT = ", nft_token_mint.publicKey.toBase58(), userTokenAccount.toBase58());
    
//     let {instructions, destinationAccounts} = await getATokenAccountsNeedCreate(
//       provider.connection,
//       user.publicKey,
//       globalAuthority,
//       [nft_token_mint.publicKey]
//     );

//     console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());

//     let userPoolKey = await PublicKey.createWithSeed(
//       user.publicKey,
//       "user-pool",
//       program.programId,
//     );

//     const tx = await program.rpc.stakeNftToPool(
//       bump, 1, 2, {
//         accounts: {
//           owner: user.publicKey,
//           userPool: userPoolKey,
//           globalAuthority,
//           userTokenAccount,
//           destNftTokenAccount: destinationAccounts[0],
//           nftMint: nft_token_mint.publicKey,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         },
//         instructions: [
//           ...instructions,
//         ],
//         signers: [user],
//       }
//     );
//     await provider.connection.confirmTransaction(tx, "singleGossip");
    
//     let poolAccount = await program.account.userPool.fetch(userPoolKey);
//     console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
//     console.log({
//       ...poolAccount,
//       stakedmints: poolAccount.stakedMints[0].mint.toBase58(),
//     })
//   });
  
//   it("Claim Reward", async () => {
//     await new Promise((resolve, reject) => {
//       setTimeout(() => {
//         resolve(1);
//       }, 21000);
//     });
//     const [globalAuthority, bump] = await PublicKey.findProgramAddress(
//       [Buffer.from(GLOBAL_AUTHORITY_SEED)],
//       program.programId
//     );

//     console.log("globalAuthority =", globalAuthority.toBase58());

//     let userPoolKey = await PublicKey.createWithSeed(
//       user.publicKey,
//       "user-pool",
//       program.programId,
//     );

//     userRewardAccount = await rewardToken.createAccount(user.publicKey);

//     const tx = await program.rpc.claimReward(
//       bump, {
//         accounts: {
//           owner: user.publicKey,
//           userPool: userPoolKey,
//           globalAuthority,
//           rewardVault,
//           userRewardAccount: userRewardAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         },
//         signers: [user]
//       }
//     );
    
//     console.log("Your transaction signature", tx); 
//     await provider.connection.confirmTransaction(tx, "finalized");
//     console.log(await provider.connection.getTokenAccountBalance(userRewardAccount));
    
//     let poolAccount = await program.account.userPool.fetch(userPoolKey);
//     console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
//     console.log({
//       // ...poolAccount,
//       stakedmints: poolAccount.stakedMints[0].mint.toBase58(),
//     })
//   });
  
//   it('Withdraw NFT from user pool', async () => {
//     console.log("Mining NFT = ", nft_token_mint.publicKey.toBase58(), userTokenAccount.toBase58());
    
//     let {instructions, destinationAccounts} = await getATokenAccountsNeedCreate(
//       provider.connection,
//       user.publicKey,
//       globalAuthority,
//       [nft_token_mint.publicKey]
//     );
//     console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());

//     // let ret = await getATokenAccountsNeedCreate(
//     //   provider.connection,
//     //   user.publicKey,
//     //   user.publicKey,
//     //   [REWARD_TOKEN_MINT]
//     // );
//     // userRewardAccount = ret.destinationAccounts[0];
//     // console.log("User Reward Account = ", userRewardAccount.toBase58());

//     let userPoolKey = await PublicKey.createWithSeed(
//       user.publicKey,
//       "user-pool",
//       program.programId,
//     );

//     const tx = await program.rpc.withdrawNftFromPool(
//       bump, {
//         accounts: {
//           owner: user.publicKey,
//           userPool: userPoolKey,
//           globalAuthority,
//           userTokenAccount,
//           destNftTokenAccount: destinationAccounts[0],
//           // rewardVault,
//           // userRewardAccount,
//           nftMint: nft_token_mint.publicKey,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           // systemProgram: SystemProgram.programId,
//           // rent: SYSVAR_RENT_PUBKEY,
//         },
//         instructions: [
//           // ...ret.instructions,
//         ],
//         signers: [user],
//       }
//     );
//     await provider.connection.confirmTransaction(tx, "singleGossip");
//     console.log(await provider.connection.getTokenAccountBalance(destinationAccounts[0]));
//     let poolAccount = await program.account.userPool.fetch(userPoolKey);
//     console.log({
//       ...poolAccount,
//       stakedMints: poolAccount.stakedMints[0].mint.toBase58(),
//     })
//   });
// });

// export const getATokenAccountsNeedCreate = async (
//   connection: anchor.web3.Connection,
//   walletAddress: anchor.web3.PublicKey,
//   owner: anchor.web3.PublicKey,
//   nfts: anchor.web3.PublicKey[],
// ) => {
//   let instructions = [], destinationAccounts = [];
//   for (const mint of nfts) {
//     const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
//     const response = await connection.getAccountInfo(destinationPubkey);
//     if (!response) {
//       const createATAIx = createAssociatedTokenAccountInstruction(
//         destinationPubkey,
//         walletAddress,
//         owner,
//         mint,
//         );
//       instructions.push(createATAIx);
//     }
//     destinationAccounts.push(destinationPubkey);
//   }
//   return {
//     instructions,
//     destinationAccounts,
//   };
// }

// const getAssociatedTokenAccount = async (ownerPubkey : PublicKey, mintPk : PublicKey) : Promise<PublicKey> => {
//   let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
//     [
//         ownerPubkey.toBuffer(),
//         TOKEN_PROGRAM_ID.toBuffer(),
//         mintPk.toBuffer(), // mint address
//     ],
//     ASSOCIATED_TOKEN_PROGRAM_ID
//   ))[0];
//   return associatedTokenAccountPubkey;
// }

// export const createAssociatedTokenAccountInstruction = (
//   associatedTokenAddress: anchor.web3.PublicKey,
//   payer: anchor.web3.PublicKey,
//   walletAddress: anchor.web3.PublicKey,
//   splTokenMintAddress: anchor.web3.PublicKey
// ) => {
//   const keys = [
//     { pubkey: payer, isSigner: true, isWritable: true },
//     { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
//     { pubkey: walletAddress, isSigner: false, isWritable: false },
//     { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SystemProgram.programId,
//       isSigner: false,
//       isWritable: false,
//     },
//     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
//       isSigner: false,
//       isWritable: false,
//     },
//   ];
//   return new anchor.web3.TransactionInstruction({
//     keys,
//     programId: ASSOCIATED_TOKEN_PROGRAM_ID,
//     data: Buffer.from([]),
//   });
// }
