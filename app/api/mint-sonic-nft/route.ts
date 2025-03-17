import { NextRequest, NextResponse } from 'next/server';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Commitment
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import {
  mplTokenMetadata,
  createNft,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createUmi
} from '@metaplex-foundation/umi-bundle-defaults';
import {
  createSignerFromKeypair,
  keypairIdentity,
  percentAmount,
  generateSigner,
  publicKey
} from '@metaplex-foundation/umi';

// Sonic SVM RPC endpoint
const SONIC_RPC_URL = 'https://api.testnet.v1.sonic.game';

// Helper function to load the payer's keypair
async function loadPayerKeypair(): Promise<Keypair | null> {
  try {
    // First try environment variable
    const keypairPath = process.env.NEXT_PUBLIC_TREE_CREATOR_KEY || 
                         path.resolve(process.env.HOME || '', '/Users/jimohabdulateef/.config/solana/id.json');
    
    console.log('Loading keypair from:', keypairPath);
    
    const keypairData = fs.readFileSync(keypairPath, 'utf-8');
    const keypairArray = JSON.parse(keypairData);
    return Keypair.fromSecretKey(new Uint8Array(keypairArray));
  } catch (error) {
    console.error('Error loading payer keypair:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received Sonic NFT mint request');
    
    // Parse the request body
    const { walletAddress, name, symbol, uri, attributes: rawAttributes } = await request.json();
    
    console.log('Request data:', { 
      walletAddress, 
      name, 
      symbol, 
      uri: uri.substring(0, 50) + '...',  // Log partial URI for privacy
    });
    
    if (!walletAddress || !name || !uri || !rawAttributes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Load the payer's keypair
    const payerKeypair = await loadPayerKeypair();
    if (!payerKeypair) {
      return NextResponse.json({ error: 'Failed to load payer keypair' }, { status: 500 });
    }

    // Connect to Sonic SVM
    const connection = new Connection(SONIC_RPC_URL, 'confirmed');
    
    // Validate attributes
    let processedAttributes = [];
    if (Array.isArray(rawAttributes)) {
      // Ensure all attributes have trait_type and value
      processedAttributes = rawAttributes.filter((attr: any) => 
        attr && typeof attr === 'object' && 
        attr.trait_type && 
        attr.value !== undefined
      );
    }

    console.log('Processing attributes:', processedAttributes);

    try {
      // Step 1: Create a new mint (token)
      console.log('Creating new mint...');
      const mint = await createMint(
        connection,
        payerKeypair,
        payerKeypair.publicKey,  // Mint authority
        payerKeypair.publicKey,  // Freeze authority
        0  // Decimals (0 for NFTs)
      );
      
      console.log('Mint created:', mint.toBase58());
      
      // Step 2: Get the token account of the wallet address
      console.log('Getting token account...');
      const recipientPublicKey = new PublicKey(walletAddress);
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payerKeypair,
        mint,
        recipientPublicKey
      );
      
      console.log('Token account:', tokenAccount.address.toBase58());
      
      // Step 3: Mint 1 token to the recipient
      console.log('Minting token...');
      await mintTo(
        connection,
        payerKeypair,
        mint,
        tokenAccount.address,
        payerKeypair.publicKey,
        1  // Amount (1 for NFTs)
      );
      
      // Now let's create the NFT metadata using Metaplex
      try {
        const commitment: Commitment = 'processed';
        
        // Create UMI instance
        let umi = createUmi(SONIC_RPC_URL)
          .use(mplTokenMetadata());
        
        // Create signer from payer keypair
        let senderUmiKeypair = umi.eddsa.createKeypairFromSecretKey(payerKeypair.secretKey);
        let senderSigner = createSignerFromKeypair(umi, senderUmiKeypair);
        
        // Set identity
        umi = umi.use(keypairIdentity(senderSigner));
        
        // Create mint signer - we'll use a generated signer since we can't access mint.secretKey
        let mintSigner = generateSigner(umi);
        // Convert Solana PublicKey to UMI PublicKey format
        mintSigner.publicKey = publicKey(mint.toBase58());
        
        // Create NFT
        console.log('Creating NFT metadata...');
        const nftBuilder = createNft(umi, {
          mint: mintSigner,
          name: name,
          symbol: symbol || "PODIUM",
          uri: uri,
          sellerFeeBasisPoints: percentAmount(0),
          isCollection: false,
          isMutable: true,
          creators: [{address: senderSigner.publicKey, verified: false, share: 100}]
        });
        
        // Build and sign transaction
        const tx = await nftBuilder.buildAndSign(umi);
        
        // Send transaction
        const txHash = await umi.rpc.sendTransaction(tx);
        console.log("NFT Metadata Tx Hash: ", txHash.toString());
        
        // Return the transaction signature and mint address
        return NextResponse.json({ 
          success: true,
          mint: mint.toBase58(),
          signature: txHash.toString(),
          message: 'NFT minted successfully on Sonic SVM',
          metadata: {
            name,
            symbol,
            uri,
            attributes: processedAttributes
          },
          explorerUrl: `https://explorer.sonic.game/tx/${txHash.toString()}`
        });
      } catch (metadataError: any) {
        console.error('Error creating NFT metadata:', metadataError);
        
        // Even if metadata creation fails, we still minted the token
        // So return success with a warning
        return NextResponse.json({ 
          success: true,
          warning: 'Token minted but metadata creation failed: ' + metadataError.message,
          mint: mint.toBase58(),
          message: 'Token minted successfully on Sonic SVM, but metadata creation failed',
          metadata: {
            name,
            symbol,
            uri,
            attributes: processedAttributes
          }
        });
      }
    } catch (mintError: any) {
      console.error('Error during Sonic NFT minting:', mintError);
      
      // Re-throw to be caught by the outer catch block
      throw mintError;
    }
  } catch (error: any) {
    console.error('Error minting Sonic NFT:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to mint NFT on Sonic SVM' 
    }, { 
      status: 500 
    });
  }
} 