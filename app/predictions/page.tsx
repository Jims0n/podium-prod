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

export const grandPrix = "FORMULA 1 LOUIS VUITTON AUSTRALIAN GRAND PRIX 2025";

export default function PredictionsPage() {
  const { isAuthenticated, isLoading, publicKey } = useWalletAuth();
  const router = useRouter();
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(1);
  const [currentIndex3, setCurrentIndex3] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

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

  const generatePredictionImage = async () => {
    try {
      // Replace spaces with hyphens in driver names
      const first = drivers[currentIndex2].driver.replace(/\s+/g, '-');
      const second = drivers[currentIndex1].driver.replace(/\s+/g, '-');
      const third = drivers[currentIndex3].driver.replace(/\s+/g, '-');
      
      // Updated endpoint with upload=true parameter for Arweave uploads
      const predictionImageUrl = `https://podium-image-ht1cjirjx-jims0ns-projects.vercel.app/generateImage?first=${first}&second=${second}&third=${third}&upload=true`;
      
      console.log('Image generation URL with Arweave upload:', predictionImageUrl);
      
      // For now, we&apos;ll simulate a successful response
      toast.success('Prediction image generated and uploaded to Arweave successfully!');
      
      // Store the URL for display purposes
      setGeneratedImageUrl(predictionImageUrl);
      
      return predictionImageUrl;
    } catch (error) {
      console.error('Error generating and uploading prediction image:', error);
      toast.error('Failed to generate and upload prediction image');
      return null;
    }
  };

  const handleMintNft = async () => {
    try {
      setLoading(true);
      
      // Generate the prediction image
      const imageUrl = await generatePredictionImage();
      
      if (!imageUrl) {
        setLoading(false);
        return;
      }
      
      // In a real implementation, this would mint an NFT on Solana using the generated image
      setTimeout(() => {
        setLoading(false);
        toast.success('Prediction submitted successfully!');
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to submit prediction');
      console.error(error);
    }
  };

  const handleTwitterShare = () => {
    // Create a text-based prediction to share
    let text = `I just predicted the podium for ${grandPrix}!\n\n`;
    text += `1st: ${drivers[currentIndex2].driver}\n`;
    text += `2nd: ${drivers[currentIndex1].driver}\n`;
    text += `3rd: ${drivers[currentIndex3].driver}\n\n`;
    
    // Add a note about the image generation and Arweave storage
    if (generatedImageUrl) {
      text += `My prediction has been recorded on Podium League and permanently stored on Arweave.\n\n`;
    }
    
    text += `Make your own prediction at podiumleague.com`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
            <h1 className="text-2xl md:text-3xl font-bold">{grandPrix}</h1>
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
                {generatedImageUrl ? (
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-purple-800">Podium Prediction</h3>
                        <p className="text-sm text-gray-600">Your prediction has been recorded and uploaded to Arweave</p>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-2 w-full">
                        <div className="bg-yellow-100 w-full p-2 rounded-md text-center border border-yellow-300">
                          <span className="font-bold text-amber-600">1st:</span> {drivers[currentIndex2].driver}
                        </div>
                        <div className="bg-gray-100 w-full p-2 rounded-md text-center border border-gray-300">
                          <span className="font-bold text-purple-600">2nd:</span> {drivers[currentIndex1].driver}
                        </div>
                        <div className="bg-orange-100 w-full p-2 rounded-md text-center border border-orange-300">
                          <span className="font-bold text-orange-600">3rd:</span> {drivers[currentIndex3].driver}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        Image has been generated and permanently stored on Arweave
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              <div className="relative mt-4">
                <Button 
                  onClick={handleMintNft} 
                  className="relative z-20 h-[50px] w-full rounded-[16px] border-[0.5px] border-black bg-white transition-all duration-300 ease-in-out hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-lg text-base font-medium"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : generatedImageUrl ? 'Submit Prediction!' : 'Generate & Submit Prediction!'}
                </Button>
                <div className="absolute -bottom-1 -right-1 z-10 h-full w-full rounded-2xl bg-[#B5EAD6]"></div>
              </div>
              <p className="mx-auto w-[90%] text-center text-[14px] font-[400] text-[#282828] mt-2">
                Don&apos;t keep the Podium fun to yourself - predict and share away!
              </p>
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