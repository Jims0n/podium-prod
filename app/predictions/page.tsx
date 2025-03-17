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
import { mintSonicNft } from '@/services/sonicNftService';
import Arweave from 'arweave';
import fs from 'fs'
import path from 'path';
import NetworkInfo from '@/components/NetworkInfo';



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
  const { isAuthenticated, publicKey } = useWalletAuth();
  const wallet = useWallet();
  const router = useRouter();
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(1);
  const [currentIndex3, setCurrentIndex3] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'solana' | 'sonic'>('solana');
  const [mintTxSignature, setMintTxSignature] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    // Check both the isAuthenticated state and the wallet connection directly
    if (!isLoading && !isAuthenticated && !wallet.connected) {
      toast.error('Please connect your wallet to access predictions');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, wallet.connected, router]);

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

  const handleMint = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setMintSuccess(false);
    setMintError(null);
    setMintTxSignature(null);
    setExplorerUrl(null);

    try {
      // Generate the prediction image
      const imageUrl = await generatePredictionImage();
      
      if (!imageUrl) {
        throw new Error('Failed to generate prediction image');
      }

      // Mint the NFT on the selected network
      let txSignature: string | null = null;
      
      if (selectedNetwork === 'solana') {
        // Mint on Solana
        txSignature = await mintCompressedNft(
          wallet,
          imageUrl,
          `F1 Prediction: ${GRAND_PRIX}`,
          {
            race: GRAND_PRIX,
            first: drivers[currentIndex2].driver,
            second: drivers[currentIndex1].driver,
            third: drivers[currentIndex3].driver,
            date: new Date().toISOString(),
          }
        );
      } else if (selectedNetwork === 'sonic') {
        // Mint on Sonic SVM
        txSignature = await mintSonicNft(
          wallet,
          imageUrl,
          `F1 Prediction: ${GRAND_PRIX}`,
          {
            race: GRAND_PRIX,
            first: drivers[currentIndex2].driver,
            second: drivers[currentIndex1].driver,
            third: drivers[currentIndex3].driver,
            date: new Date().toISOString(),
          }
        );
        
        // Set explorer URL for Sonic
        if (txSignature) {
          setExplorerUrl(`https://explorer.sonic.game/tx/${txSignature}`);
        }
      }
      
      if (txSignature) {
        setMintTxSignature(txSignature);
        setTxSignature(txSignature);
        setMintSuccess(true);
        toast.success(`Successfully minted your prediction NFT on ${selectedNetwork === 'sonic' ? 'Sonic SVM' : 'Solana'}!`);
      } else {
        throw new Error('No transaction signature returned');
      }
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      setMintError(error.message || 'Failed to mint NFT');
      toast.error(`Failed to mint NFT: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
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
      if (selectedNetwork === 'solana') {
        text += `View my NFT on Solana Explorer: https://explorer.solana.com/tx/${txSignature}?cluster=devnet\n\n`;
      } else {
        text += `View my NFT on Sonic Explorer: https://explorer.sonic.game/tx/${txSignature}\n\n`;
      }
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
        <p>You are about to mint your prediction as an NFT on {selectedNetwork === 'solana' ? 'Solana' : 'Sonic SVM'}.</p>
        <p>This will require a small amount of {selectedNetwork === 'solana' ? 'SOL' : 'Sonic tokens'} for transaction fees.</p>
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
              handleMint();
            }}
            className="text-xs"
            style={{
              backgroundColor: selectedNetwork === 'solana' ? '#9333ea' : '#2563eb'
            }}
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

  // Confirmation Dialog
  const openConfirmDialog = () => {
    setIsConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmOpen(false);
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
      ) : (!isAuthenticated && !wallet.connected) ? (
        null
      ) : (
        <section className="py-4 px-4 md:px-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{GRAND_PRIX}</h1>
            <p className="text-sm text-muted-foreground">Predict the podium finishers for this race</p>
          </div>
          
          {/* Network Selector */}
          <div className="mb-6 flex justify-center">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedNetwork('solana')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedNetwork === 'solana'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Solana (Compressed)
                </button>
                <button
                  onClick={() => setSelectedNetwork('sonic')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedNetwork === 'sonic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Sonic SVM
                </button>
              </div>
            </div>
          </div>
          
          {/* Network Info */}
          <NetworkInfo network={selectedNetwork} />
          
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
                {isLoading && (
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
                <div className="flex flex-col items-center mt-8">
                  <button
                    onClick={openConfirmDialog}
                    disabled={isLoading || !isAuthenticated || !wallet.connected}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 ${
                      isLoading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : mintSuccess
                        ? 'bg-green-500 hover:bg-green-600'
                        : mintError
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Minting...
                      </div>
                    ) : mintSuccess ? (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Minted!
                      </div>
                    ) : mintError ? (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Failed
                      </div>
                    ) : (
                      `Mint on ${selectedNetwork === 'sonic' ? 'Sonic SVM' : 'Solana'}`
                    )}
                  </button>
                  
                  {/* Transaction Explorer Link */}
                  {mintSuccess && explorerUrl && (
                    <div className="mt-4 text-center">
                      <a 
                        href={explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline"
                      >
                        View transaction on explorer
                      </a>
                    </div>
                  )}
                  
                  {/* Twitter Share Button */}
                  {mintSuccess && (
                    <div className="mt-2">
                      <button
                        onClick={handleTwitterShare}
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-[#1DA1F2] hover:bg-[#1a94e0]"
                      >
                        <BsTwitter className="mr-2 h-4 w-4" />
                        Share on Twitter
                      </button>
                    </div>
                  )}
                  
                  <p className="mt-4 text-center text-gray-600">
                    Predict the podium and share your prediction with friends!
                  </p>
                </div>
              </div>
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
          
          {/* Confirmation Dialog */}
          {isConfirmOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Confirm Mint</h3>
                <p className="mb-4">
                  You are about to mint your prediction as an NFT on {selectedNetwork === 'sonic' ? 'Sonic SVM' : 'Solana'}.
                </p>
                <p className="mb-4">
                  <strong>Race:</strong> {GRAND_PRIX}<br />
                  <strong>1st Place:</strong> {drivers[currentIndex2].driver}<br />
                  <strong>2nd Place:</strong> {drivers[currentIndex1].driver}<br />
                  <strong>3rd Place:</strong> {drivers[currentIndex3].driver}
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeConfirmDialog}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      closeConfirmDialog();
                      handleMint();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </ClientOnly>
  );
} 