import { NextRequest, NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { 
  mintToCollectionV1,
  mplBubblegum,
  MetadataArgsArgs,
  TokenProgramVersion,
  TokenStandard
} from '@metaplex-foundation/mpl-bubblegum';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Tree address and Collection mint address
const TREE_ADDRESS = process.env.NEXT_PUBLIC_TREE_ADDRESS || '';
const COLLECTION_MINT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_MINT_ADDRESS || '';

// Helper function to load the tree creator's keypair
async function loadTreeCreatorKeypair(): Promise<Keypair | null> {
  try {
    // First try environment variable
    const keypairPath = process.env.NEXT_PUBLIC_TREE_CREATOR_KEY || 
                         path.resolve(process.env.HOME || '', '/Users/jimohabdulateef/.config/solana/id.json');
    
    console.log('Loading keypair from:', keypairPath);
    
    const keypairData = fs.readFileSync(keypairPath, 'utf-8');
    const keypairArray = JSON.parse(keypairData);
    return Keypair.fromSecretKey(new Uint8Array(keypairArray));
  } catch (error) {
    console.error('Error loading tree creator keypair:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received mint NFT request');
    
    // Parse the request body
    const { walletAddress, name, symbol, uri, attributes: rawAttributes } = await request.json();
    
    console.log('Request data:', { 
      walletAddress, 
      name, 
      nameLength: name.length,
      symbol, 
      uri: uri.substring(0, 50) + '...',  // Log partial URI for privacy
    });
    
    if (!walletAddress || !name || !uri || !rawAttributes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!TREE_ADDRESS || !COLLECTION_MINT_ADDRESS) {
      console.error('Missing environment variables:', { 
        treeAddress: !!TREE_ADDRESS, 
        collectionMintAddress: !!COLLECTION_MINT_ADDRESS 
      });
      return NextResponse.json({ error: 'Missing tree address or collection mint address' }, { status: 500 });
    }

    // Load the tree creator's keypair
    const treeCreatorKeypair = await loadTreeCreatorKeypair();
    if (!treeCreatorKeypair) {
      return NextResponse.json({ error: 'Failed to load tree creator keypair' }, { status: 500 });
    }

    // Initialize Umi with the tree creator's keypair
    const umi = createUmi('https://api.devnet.solana.com')
      .use(mplBubblegum());

    // Create a signer from the keypair and add it to Umi
    const treeCreatorSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(treeCreatorKeypair.publicKey.toBase58()),
      secretKey: treeCreatorKeypair.secretKey,
    });
    
    // This ensures the tree creator will sign the transaction
    umi.use(keypairIdentity(treeCreatorSigner));

    // Ensure name is within 32 character limit for compressed NFTs
    const truncatedName = name.length > 32 ? name.substring(0, 32) : name;

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

    // Prepare the metadata for the NFT
    const metadataArgs: MetadataArgsArgs = {
      name: truncatedName,
      symbol: symbol || 'PODIUM',
      uri,
      sellerFeeBasisPoints: 0, // No royalties
      creators: [
        {
          address: treeCreatorSigner.publicKey, // Use the tree creator as the creator
          verified: true, // This needs to be true because the tree creator is signing
          share: 95, // Primary creator gets 95%
        },
        {
          address: publicKey(walletAddress), // The user's wallet
          verified: false, // Not verified by the user in this transaction
          share: 5, // User gets 5%
        }
      ],
      collection: {
        key: publicKey(COLLECTION_MINT_ADDRESS),
        verified: false, // This will be verified as part of the mint process
      },
      uses: null,
      primarySaleHappened: false,
      isMutable: true,
      editionNonce: null,
      tokenStandard: TokenStandard.NonFungible,
      tokenProgramVersion: TokenProgramVersion.Original,
      // Add attributes if available
      ...(processedAttributes.length > 0 ? { attributes: processedAttributes } : {}),
    };

    // Mint the compressed NFT
    try {
      console.log('Minting NFT with params:', {
        leafOwner: walletAddress,
        merkleTree: TREE_ADDRESS,
        collectionMint: COLLECTION_MINT_ADDRESS,
        metadataName: truncatedName
      });
      
      const mintResult = await mintToCollectionV1(umi, {
        leafOwner: publicKey(walletAddress),
        merkleTree: publicKey(TREE_ADDRESS),
        collectionMint: publicKey(COLLECTION_MINT_ADDRESS),
        metadata: metadataArgs,
      }).sendAndConfirm(umi);

      console.log('NFT mint successful:', mintResult);
      
      // Return the transaction signature
      return NextResponse.json({ 
        success: true,
        signature: mintResult.signature.toString(),
        message: 'NFT minted successfully' 
      });
    } catch (mintError: any) {
      console.error('Error during mintToCollectionV1:', mintError);
      
      // Check for specific error types
      if (mintError.message && mintError.message.includes('MetadataNameTooLong')) {
        return NextResponse.json({ 
          error: 'NFT name is too long. Please use a shorter name (32 characters max).' 
        }, { 
          status: 400 
        });
      }
      
      if (mintError.message && mintError.message.includes('CreatorDidNotVerify')) {
        return NextResponse.json({ 
          error: 'Creator verification failed. Please check that the tree creator has proper permissions.' 
        }, { 
          status: 400 
        });
      }
      
      // Re-throw to be caught by the outer catch block
      throw mintError;
    }
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to mint NFT' 
    }, { 
      status: 500 
    });
  }
} 