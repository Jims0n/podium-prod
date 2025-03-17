/**
 * Regular (Non-Compressed) NFT Minting on Sonic SVM
 * 
 * This script demonstrates how to mint a regular NFT on Sonic SVM using the Metaplex SDK.
 * Unlike compressed NFTs, regular NFTs don't require Merkle trees or the account compression program.
 * 
 * NOTE ON NFT METADATA:
 * For a production NFT, you would need to:
 * 1. Create a JSON metadata file following the Metaplex standard:
 *    {
 *      "name": "My NFT",
 *      "description": "Description of my NFT",
 *      "image": "https://arweave.net/your-image-uri",
 *      "attributes": [
 *        { "trait_type": "Color", "value": "Blue" },
 *        { "trait_type": "Size", "value": "Large" }
 *      ]
 *    }
 * 
 * 2. Upload this JSON file to a permanent storage solution like Arweave or IPFS
 * 
 * 3. Replace the placeholder URI in this script with your actual metadata URI
 */

import { 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import {
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

import {
  loadKeypairFromFile,
  loadOrGenerateKeypair,
  numberFormatter,
} from "@/utils/helpers";

import dotenv from "dotenv";
dotenv.config();

(async () => {
  console.log("Sonic SVM Regular NFT Minting Script");
  console.log("===================================");

  // Load keypairs
  const payer = process.env?.LOCAL_PAYER_JSON_ABSPATH
    ? loadKeypairFromFile(process.env?.LOCAL_PAYER_JSON_ABSPATH)
    : loadOrGenerateKeypair("payer");

  const testWallet = loadOrGenerateKeypair("testWallet");

  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());
  console.log("You can view these addresses on Sonic Explorer: https://explorer.sonic.game/");
  console.log("If you need SOL, get it from the faucet: https://faucet.sonic.game/#/");

  // Connect to Sonic SVM
  const SONIC_RPC_URL = process.env.SONIC_RPC_URL || "https://api.testnet.v1.sonic.game";
  console.log("\nAttempting to connect to Sonic SVM Testnet RPC URL:", SONIC_RPC_URL);

  try {
    const connection = new Connection(SONIC_RPC_URL, "confirmed");
    
    // Test the connection with a simple request
    const recentBlockhash = await connection.getRecentBlockhash();
    console.log("Successfully connected to Sonic SVM Testnet");
    console.log("Recent blockhash:", recentBlockhash.blockhash);
    
    // Get account balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log("Payer balance:", numberFormatter(balance / LAMPORTS_PER_SOL), "SOL");
    
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      console.error("Not enough SOL to mint an NFT (need at least 0.1 SOL)");
      console.error("Please get some SOL from the faucet: https://faucet.sonic.game/#/");
      return;
    }
    
    console.log("\n--- Starting NFT Minting Process ---");
    
    // Step 1: Create a new token mint
    console.log("\nStep 1: Creating a new token mint...");
    const mintKeypair = Keypair.generate();
    console.log("Mint address:", mintKeypair.publicKey.toBase58());
    
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create the token mint
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,  // mint authority
      payer.publicKey,  // freeze authority (you can use `null` to disable it)
      0                 // decimals (use 0 for NFTs)
    );
    
    console.log("Token mint created:", mint.toBase58());
    
    // Step 2: Create a token account for the payer
    console.log("\nStep 2: Creating a token account...");
    const tokenAccount = await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    
    console.log("Token account created:", tokenAccount.toBase58());
    
    // Step 3: Mint one token to the payer's token account
    console.log("\nStep 3: Minting one token...");
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount,
      payer,
      1,  // mint exactly 1 token
      []  // no multi-signers
    );
    
    console.log("Token minted successfully");
    
    // Step 4: Create metadata for the NFT
    console.log("\nStep 4: Creating NFT metadata...");
    
    // Derive the metadata account address
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log("Metadata account address:", metadataAccount.toBase58());
    
    // Create metadata instruction
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAccount,
        mint: mint,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Sonic SVM NFT",
            symbol: "SONIC",
            uri: "https://arweave.net/jbPo4JfE2nv7OLLQho4WAXgUWIPkO5I7j6OTeqAHP_I",
            sellerFeeBasisPoints: 500, // 5%
            creators: [
              {
                address: payer.publicKey,
                verified: true,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );
    
    // Step 5: Create master edition
    console.log("\nStep 5: Creating master edition...");
    
    // Derive the master edition account address
    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log("Master edition account address:", masterEditionAccount.toBase58());
    
    // Create master edition instruction
    const createMasterEditionInstruction = createCreateMasterEditionV3Instruction(
      {
        edition: masterEditionAccount,
        mint: mint,
        updateAuthority: payer.publicKey,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        metadata: metadataAccount,
      },
      {
        createMasterEditionArgs: {
          maxSupply: 0, // 0 for a unique NFT
        },
      }
    );
    
    // Step 6: Send transaction with both instructions
    console.log("\nStep 6: Sending transaction to create metadata and master edition...");
    
    const transaction = new Transaction()
      .add(createMetadataInstruction)
      .add(createMasterEditionInstruction);
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );
    
    console.log("Transaction successful!");
    console.log("Signature:", signature);
    console.log("View on Sonic Explorer:", `https://explorer.sonic.game/tx/${signature}`);
    
    // Print summary
    console.log("\n--- NFT Minting Summary ---");
    console.log("NFT Mint Address:", mint.toBase58());
    console.log("Owner:", payer.publicKey.toBase58());
    console.log("Metadata Account:", metadataAccount.toBase58());
    console.log("Master Edition Account:", masterEditionAccount.toBase58());
    console.log("\nYou can view your NFT on Sonic Explorer by searching for your wallet address");
    
    console.log("\nSonic SVM regular NFT minting completed successfully!");
    
  } catch (error: any) {
    console.error("Error minting NFT on Sonic SVM:", error.message);
    
    if (error.message.includes("getaddrinfo")) {
      console.error("\nCannot resolve the Sonic SVM RPC URL. Please check your internet connection and the URL.");
    } else if (error.message.includes("failed to send transaction")) {
      console.error("\nFailed to send transaction. This might indicate an issue with the Sonic SVM network.");
    } else {
      console.error("\nDetailed error:", error);
    }
  }
})();
