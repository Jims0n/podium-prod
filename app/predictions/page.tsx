"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ClientOnly from '@/components/utils/ClientOnly';

export default function PredictionsPage() {
  const { isAuthenticated, isLoading, publicKey } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please connect your wallet to access predictions');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <ClientOnly fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we verify your wallet</p>
        </div>
      </div>
    }>
      {isLoading ? (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we verify your wallet</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        null
      ) : (
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">Make Your Predictions</h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Example prediction card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Formula 1 - Monaco Grand Prix</h3>
                <p className="text-muted-foreground">Predict the podium finishers for the upcoming race</p>
                
                <div className="space-y-2">
                  <p className="font-medium">Deadline: May 25, 2024 - 14:00 UTC</p>
                  <p className="text-sm text-muted-foreground">Rewards: 100 USDC for correct predictions</p>
                </div>
                
                <Button className="w-full">Make Prediction</Button>
              </div>
            </div>
            
            {/* More prediction cards would go here */}
          </div>
        </div>
      )}
    </ClientOnly>
  );
} 