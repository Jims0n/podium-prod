"use client"
import Image from "next/image";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ClientOnly from "@/components/utils/ClientOnly";

export default function Home() {
  const { isAuthenticated, isLoading, publicKey } = useWalletAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toString());
    } else {
      setWalletAddress(null);
    }
  }, [publicKey]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <div className="max-w-3xl space-y-8">
        <Image 
          src="/images/podium.png" 
          alt="Podium League" 
          width={200} 
          height={200} 
          className="mx-auto"
        />
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Podium League
        </h1>
        
        <p className="text-xl text-muted-foreground">
          The onchain F1 mini league powered by Solana and Sonic SVM. Connect your wallet to start making predictions and climb the leaderboard.
        </p>
        
       
        
        <ClientOnly fallback={
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
              <span className="font-medium">
                Please connect your wallet to continue
              </span>
            </div>
            
            <p className="text-muted-foreground">
              Click the &quot;Connect Wallet&quot; button in the top right corner to get started
            </p>
          </div>
        }>
          {isAuthenticated ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-medium">
                  Connected: {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="relative">
                  <Button asChild size="lg">
                    <Link href="/predictions">
                      Make Predictions
                    </Link>
                  </Button>
                </div>
                <Button asChild variant="outline" size="lg">
                  <Link href="/leaderboard">
                    View Leaderboard
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
                <span className="font-medium">
                  Please connect your wallet to continue
                </span>
              </div>
              
              <p className="text-muted-foreground">
                Click the &quot;Connect Wallet&quot; button in the top right corner to get started
              </p>
            </div>
          )}
        </ClientOnly>
        
        <div className="mt-12 text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          <p>
            This website is unofficial and is not associated in any way with the Formula 1 companies. 
            F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks 
            are trade marks of Formula One Licensing B.V.
          </p>
        </div>
      </div>
    </div>
  );
}