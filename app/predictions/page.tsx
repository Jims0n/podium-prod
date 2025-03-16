"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ClientOnly from '@/components/utils/ClientOnly';
import Image from 'next/image';
import { BsTwitter } from 'react-icons/bs';
import { drivers } from '@/constants/drivers';
import ChangePlayer from '@/components/ChangePlayer';
import { useWallet } from '@solana/wallet-adapter-react';
import { mintCompressedNft, PredictionAttributes } from '@/services/nftService';
import Arweave from 'arweave';
import fs from 'fs'
import path from 'path';



// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export default function PredictionsPage() {
  // Constants
  const GRAND_PRIX = "FORMULA 1 LOUIS VUITTON AUSTRALIAN GRAND PRIX 2025";
  const TREE_CREATOR_KEY = process.env.NEXT_PUBLIC_TREE_CREATOR_KEY;
  
  // State and hooks
  const { isAuthenticated, isLoading, publicKey } = useWalletAuth();
  const wallet = useWallet(); // Add the wallet hook for minting
  const router = useRouter();
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(1);
  const [currentIndex3, setCurrentIndex3] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please connect your wallet to access predictions');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleForwardClick = (setIndex: (index: number) => void, currentIndex: number) => {
    if (currentIndex < drivers.length - 1) {
      setIndex(currentIndex + 1);
    }
  };

  const handleBackwardClick = (setIndex: (index: number) => void, currentIndex: number) => {
    if (currentIndex > 0) {
      setIndex(currentIndex - 1);
    }
  };

  const generatePredictionImage = async (retryCount = 0, maxRetries = 3) => {
    try {
      // Replace spaces with hyphens in driver names
      const first = drivers[currentIndex2].driver.replace(/\s+/g, '-');
      const second = drivers[currentIndex1].driver.replace(/\s+/g, '-');
      const third = drivers[currentIndex3].driver.replace(/\s+/g, '-');
      
      // Updated endpoint with upload=true parameter for Arweave uploads
      const predictionImageUrl = `https://podium-image-api-3h72-git-main-jims0ns-projects.vercel.app/generateImage?first=${first}&second=${second}&third=${third}&upload=true`;
      
      //console.log('Image generation URL with Arweave upload:', predictionImageUrl);
      
      // Actually fetch the image URL to ensure it's valid
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(predictionImageUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Arweave:", data.imageUrl);
      // For now, we'll simulate a successful response
      toast.success('Prediction image generated and uploaded to Arweave successfully!');
      
      // Store the URL for display purposes
      setGeneratedImageUrl(data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating and uploading prediction image:', error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        toast.info(`Retrying image generation (${retryCount + 1}/${maxRetries})...`);
        return generatePredictionImage(retryCount + 1, maxRetries);
      }
      
      toast.error('Failed to generate and upload prediction image after multiple attempts');
      return null;
    }
  };

  const handleMintNft = async () => {
    try {
      // Check if wallet is connected
      if (!wallet.connected || !wallet.publicKey) {
        toast.error('Please connect your wallet to mint an NFT');
        return;
      }
      
      // Check for duplicate drivers
      if (hasDuplicateDrivers()) {
        toast.error('Duplicate drivers are not allowed. Please select different drivers for each position.');
        return;
      }
      
      setLoading(true);
      setMintError(null); // Clear any previous errors
      
      // Generate the prediction image
      const imageUrl = await generatePredictionImage();

      if (!imageUrl) {
        setLoading(false);
        setMintError('Failed to generate prediction image');
        return;
      }
      
      console.log('Image URL:', imageUrl);
      
      // Create the NFT attributes
      const predictionAttributes: PredictionAttributes = {
        race: GRAND_PRIX,
        first: drivers[currentIndex2].driver,
        second: drivers[currentIndex1].driver,
        third: drivers[currentIndex3].driver,
        date: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
      
      // Generate a shorter name for the NFT (max 32 characters)
      const nftName = `Podium: Australian GP 2025`;
      
      // Mint the compressed NFT
      try {
        const signature = await mintCompressedNft(
          wallet,
          imageUrl,
          nftName,
          predictionAttributes
        );
        
        setTxSignature(signature);
        setMintError(null); // Clear any errors on success
        toast.success('Prediction successfully minted as an NFT!');
        console.log(`NFT minted successfully! Transaction: ${signature}`);
      } catch (mintError: any) {
        console.error('Mint error:', mintError);
        
        // Set the error message for the UI
        let errorMessage = mintError.message || 'Unknown error';
        
        // Show a more specific error message based on the error
        if (mintError.message.includes('Wallet not connected')) {
          errorMessage = 'Please connect your wallet to mint an NFT';
        } else if (mintError.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL balance. Please add more SOL to your wallet.';
        } else if (mintError.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by the wallet';
        }
        
        setMintError(errorMessage);
        toast.error(`Failed to mint NFT: ${errorMessage}`);
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || 'Unknown error';
      setMintError(errorMessage);
      toast.error(`Failed to submit prediction: ${errorMessage}`);
      console.error(error);
    }
  };

  const handleTwitterShare = () => {
    // Create a text-based prediction to share
    let text = `I just predicted the podium for ${GRAND_PRIX}!\n\n`;
    text += `1st: ${drivers[currentIndex2].driver}\n`;
    text += `2nd: ${drivers[currentIndex1].driver}\n`;
    text += `3rd: ${drivers[currentIndex3].driver}\n\n`;
    
    // Add a note about the image generation and Arweave storage
    if (generatedImageUrl) {
      text += `My prediction has been recorded on Podium League and permanently stored on Arweave.\n\n`;
    }
    
    // If the transaction was successful, include the transaction link
    if (txSignature) {
      text += `View my NFT on Solana Explorer: https://explorer.solana.com/tx/${txSignature}?cluster=devnet\n\n`;
    }
    
    text += `Make your own prediction at podiumleague.com`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Function to check for duplicate drivers
  const hasDuplicateDrivers = () => {
    const first = drivers[currentIndex2].driver;
    const second = drivers[currentIndex1].driver;
    const third = drivers[currentIndex3].driver;
    
    return first === second || first === third || second === third;
  };

  const confirmMint = () => {
    // Check for duplicate drivers before showing confirmation
    if (hasDuplicateDrivers()) {
      toast.error('Duplicate drivers are not allowed. Please select different drivers for each position.');
      return;
    }
    
    // Show a confirmation toast
    toast.info(
      <div className="flex flex-col gap-2">
        <p>You are about to mint your prediction as an NFT on Solana.</p>
        <p>This will require a small amount of SOL for transaction fees.</p>
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast.dismiss()}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={() => {
              toast.dismiss();
              handleMintNft();
            }}
            className="text-xs"
          >
            Confirm Mint
          </Button>
        </div>
      </div>,
      {
        duration: 10000,
      }
    );
  };

  const LoadingView = () => (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we verify your wallet</p>
      </div>
    </div>
  );

  return (
    <ClientOnly fallback={<LoadingView />}>
      {isLoading ? (
        <LoadingView />
      ) : !isAuthenticated ? (
        null
      ) : (
        <section className="py-4 px-4 md:px-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{GRAND_PRIX}</h1>
            <p className="text-sm text-muted-foreground">Predict the podium finishers for this race</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Left Column - Pick your racer */}
            <div className="bg-white/50 p-4 rounded-xl border shadow-sm">
              <div className="flex w-full flex-row items-center justify-start mb-3">
                <h2 className="flex-1 text-lg font-bold">
                  Pick your racers
                </h2>
                <Image
                  src="/images/helmet.png"
                  className="h-[30px] w-[30px]"
                  alt="Helmet"
                  width={30}
                  height={30}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="w-[15%] text-center text-xl font-bold text-amber-500">
                    1st
                  </span>
                  <ChangePlayer
                    color="#F6EAC2"
                    currentIndex={currentIndex2}
                    onSelectName={() => {}}
                    onForwardClick={() =>
                      handleForwardClick(setCurrentIndex2, currentIndex2)
                    }
                    onBackwardClick={() =>
                      handleBackwardClick(setCurrentIndex2, currentIndex2)
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="w-[15%] text-center text-xl font-bold text-purple-500">
                    2nd
                  </span>
                  <ChangePlayer
                    currentIndex={currentIndex1}
                    onSelectName={() => {}}
                    onForwardClick={() =>
                      handleForwardClick(setCurrentIndex1, currentIndex1)
                    }
                    onBackwardClick={() =>
                      handleBackwardClick(setCurrentIndex1, currentIndex1)
                    }
                    color="#DFCCF1"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="w-[15%] text-center text-xl font-bold text-orange-500">
                    3rd
                  </span>
                  <ChangePlayer
                    currentIndex={currentIndex3}
                    onSelectName={() => {}}
                    onForwardClick={() =>
                      handleForwardClick(setCurrentIndex3, currentIndex3)
                    }
                    onBackwardClick={() =>
                      handleBackwardClick(setCurrentIndex3, currentIndex3)
                    }
                    color="#FFB8B1"
                  />
                </div>
              </div>
            </div>

            {/* Middle Column - Podium */}
            <div className="bg-white/50 p-4 rounded-xl border shadow-sm">
              <div className="relative w-full h-[300px]">
                {loading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm font-medium">Generating prediction...</p>
                    </div>
                  </div>
                )}
              
                <div className="absolute inset-0 rounded-lg bg-cover bg-center bg-no-repeat" 
                  style={{ backgroundImage: "url('/images/background-illustration.png')" }}></div>
                <div className="absolute inset-0 flex h-full w-full flex-row items-end justify-center gap-2 p-2">
                  <div className="flex w-1/3 flex-col items-center justify-center">
                    <Image
                      src="/images/podium_silver.webp"
                      alt="second winner"
                      className="relative z-10 h-full w-[95%]"
                      width={120}
                      height={160}
                    />
                    <div className="relative z-0 -mt-3 rounded-lg border bg-purple-200 p-2 py-4 text-center font-medium text-sm">
                      {drivers[currentIndex1].driver}
                    </div>
                  </div>
                  <div className="-mt-8 flex w-1/3 flex-col items-center justify-center">
                    <Image
                      src="/images/podium_gold.webp"
                      alt="winner"
                      className="relative z-10 h-full w-[100%]"
                      width={120}
                      height={160}
                    />
                    <div className="relative z-0 -mt-3 rounded-lg border bg-yellow-200 p-2 py-6 text-center font-medium text-sm">
                      {drivers[currentIndex2].driver}
                    </div>
                  </div>
                  <div className="flex w-1/3 flex-col items-center justify-center">
                    <Image
                      src="/images/podium_bronze.webp"
                      alt="third winner"
                      className="relative z-10 h-full w-[95%]"
                      width={120}
                      height={160}
                    />
                    <div className="relative z-0 -mt-3 rounded-lg border bg-orange-200 p-2 text-center font-medium text-sm">
                      {drivers[currentIndex3].driver}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mt-4">
                <Button 
                  onClick={confirmMint} 
                  className={`relative z-20 h-[50px] w-full rounded-[16px] border-[0.5px] border-black ${
                    loading ? 'bg-gray-200' : txSignature ? 'bg-green-100' : mintError ? 'bg-red-50' : 'bg-white'
                  } transition-all duration-300 ease-in-out hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-lg text-base font-medium`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      <span>Minting NFT...</span>
                    </div>
                  ) : txSignature ? (
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Minted Successfully!</span>
                    </div>
                  ) : mintError ? (
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Retry Minting</span>
                    </div>
                  ) : (
                    'Generate & Mint NFT Prediction!'
                  )}
                </Button>
                <div className="absolute -bottom-1 -right-1 z-10 h-full w-full rounded-2xl bg-[#B5EAD6]"></div>
              </div>
              <p className="mx-auto w-[90%] text-center text-[14px] font-[400] text-[#282828] mt-2">
                Don&apos;t keep the Podium fun to yourself - predict and share away!
              </p>
              {txSignature && (
                <div className="mt-4 flex justify-center">
                  <a 
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Solana Explorer
                  </a>
                </div>
              )}
              {mintError && (
                <div className="mt-2 text-center text-sm text-red-500">
                  {mintError}
                </div>
              )}
            </div>

            {/* Right Column - Share */}
            <div className="bg-white/50 p-4 rounded-xl border shadow-sm">
              <div className="flex flex-col items-center justify-between">
                <h2 className="text-lg font-bold mb-2">
                  Share your strategy!
                </h2>
                <button
                  onClick={handleTwitterShare}
                  className="border-1 mx-auto mt-2 flex items-center justify-center rounded-2xl border border-black bg-[#C7E8FF] p-2 transition-all duration-300 ease-in-out hover:scale-110"
                >
                  <BsTwitter className="h-[36px] w-[36px] text-[#1D9BF0]" />
                </button>
              </div>
              <div className="mt-[20px] h-[6px] w-full rounded-3xl bg-[#FFEFD8]"></div>
            
              <div className="mt-4 flex flex-col items-center">
                <p className="text-base font-medium mb-2">Watch the race highlights</p>
                <div className="cursor-pointer overflow-hidden rounded-lg border shadow-sm">
                  <Image
                    src="/images/Video cover pjynoXnzUEw.png"
                    className="h-[120px] w-[220px] object-cover transition-transform hover:scale-105"
                    alt="Video cover"
                    width={220}
                    height={120}
                    onClick={() => window.open("https://www.youtube.com/watch?v=pjynoXnzUEw", "_blank")}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="relative">
                  <Button
                    onClick={() => window.open("https://sporting.gg", "_blank")}
                    className="relative z-20 h-[45px] w-[150px] rounded-[16px] border-[0.5px] border-black bg-white transition-all duration-300 ease-in-out hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-lg text-base font-medium"
                    variant="outline"
                  >
                    View league
                  </Button>
                  <div className="absolute -bottom-1 -right-1 z-10 h-full w-full rounded-2xl bg-[#FFEFD8]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </ClientOnly>
  );
} 