import { WalletContextState } from '@solana/wallet-adapter-react';

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

export async function mintCompressedNft(
  wallet: WalletContextState,
  imageUrl: string,
  name: string,
  attributes: PredictionAttributes
): Promise<string | null> {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Prepare the NFT metadata attributes
    const nftAttributes = convertAttributesToMetaplexFormat(attributes);
    
    // Use our API route to handle the minting
    const mintApiUrl = '/api/mint-nft';
    
    console.log('Minting NFT with name:', name, '(length:', name.length, ')');
    
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
      const errorMessage = data.error || 'Failed to mint NFT';
      
      // Handle specific error cases
      if (errorMessage.includes('name is too long')) {
        throw new Error('NFT name is too long. Please use a shorter name.');
      } else if (errorMessage.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance to mint NFT. Please add more SOL to your wallet.');
      } else if (errorMessage.includes('Creator verification failed')) {
        throw new Error('Creator verification failed. Please try again or contact support.');
      } else if (errorMessage.includes('keypair')) {
        throw new Error('Server configuration issue. Please contact support.');
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('NFT mint successful:', data);
    
    // Return the transaction signature
    return data.signature;
  } catch (error: any) {
    console.error('Error minting compressed NFT:', error);
    // Re-throw the error so it can be handled by the UI
    throw error;
  }
} 