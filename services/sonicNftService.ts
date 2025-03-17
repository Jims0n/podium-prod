import { WalletContextState } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

// This interface represents the attributes we want to store in the NFT metadata
export interface PredictionAttributes {
  race: string;
  first: string;
  second: string;
  third: string;
  points?: number; // Optional, might be calculated later
  date: string;
}

// Convert our attributes to the format expected by Metaplex
function convertAttributesToMetaplexFormat(attributes: PredictionAttributes) {
  return [
    { trait_type: 'Race', value: attributes.race },
    { trait_type: 'First Place', value: attributes.first },
    { trait_type: 'Second Place', value: attributes.second },
    { trait_type: 'Third Place', value: attributes.third },
    ...(attributes.points !== undefined ? [{ trait_type: 'Points', value: attributes.points.toString() }] : []),
    { trait_type: 'Date', value: attributes.date },
  ];
}

// Sonic SVM RPC endpoint
const SONIC_RPC_URL = 'https://api.testnet.v1.sonic.game';

/**
 * Mints a regular NFT on Sonic SVM
 */
export async function mintSonicNft(
  wallet: WalletContextState,
  imageUrl: string,
  name: string,
  attributes: PredictionAttributes
): Promise<string | null> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }
    
    // Connect to Sonic SVM
    const connection = new Connection(SONIC_RPC_URL, 'confirmed');
    
    // Check if the wallet has enough SOL
    const balance = await connection.getBalance(wallet.publicKey);
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      throw new Error('Insufficient SOL balance. Please get SOL from the Sonic faucet: https://faucet.sonic.game');
    }
    
    // Prepare the NFT metadata attributes
    const nftAttributes = convertAttributesToMetaplexFormat(attributes);
    
    // Create metadata JSON
    const metadata = {
      name,
      symbol: 'PODIUM',
      description: 'Podium League F1 Prediction',
      image: imageUrl,
      attributes: nftAttributes,
      properties: {
        files: [{ uri: imageUrl, type: 'image/png' }],
        category: 'image',
        creators: [{ address: wallet.publicKey.toString(), share: 100 }]
      }
    };
    
    // For simplicity, we'll use the API route to handle the actual minting
    // This avoids having to handle private keys in the client
    const mintApiUrl = '/api/mint-sonic-nft';
    
    console.log('Minting Sonic NFT with name:', name);
    
    // Send request to the server to mint the NFT
    const response = await fetch(mintApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: wallet.publicKey.toString(),
        name,
        symbol: 'PODIUM',
        uri: imageUrl,
        attributes: nftAttributes,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Extract specific error message from the response
      const errorMessage = data.error || 'Failed to mint NFT on Sonic';
      throw new Error(errorMessage);
    }
    
    console.log('Sonic NFT mint successful:', data);
    
    // Return the transaction signature
    return data.signature || data.mint;
  } catch (error: any) {
    console.error('Error minting Sonic NFT:', error);
    // Re-throw the error so it can be handled by the UI
    throw error;
  }
} 