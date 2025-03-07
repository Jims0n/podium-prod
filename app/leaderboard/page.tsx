"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';
import ClientOnly from '@/components/utils/ClientOnly';

export default function LeaderboardPage() {
  const { isAuthenticated, isLoading } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please connect your wallet to view the leaderboard');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, wallet: '8xFG...j29P', points: 250, predictions: 12 },
    { rank: 2, wallet: '3mKL...p7tR', points: 220, predictions: 15 },
    { rank: 3, wallet: '9qWE...s5vB', points: 185, predictions: 10 },
    { rank: 4, wallet: '2zXC...h8nM', points: 160, predictions: 14 },
    { rank: 5, wallet: '7aSD...k4jL', points: 145, predictions: 11 },
    { rank: 6, wallet: '5vFR...g6bN', points: 130, predictions: 9 },
    { rank: 7, wallet: '1cVB...d3xZ', points: 115, predictions: 13 },
    { rank: 8, wallet: '4tGB...y2wQ', points: 100, predictions: 8 },
    { rank: 9, wallet: '6hNM...u9iO', points: 85, predictions: 7 },
    { rank: 10, wallet: '0jKL...r1eP', points: 70, predictions: 6 },
  ];

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
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Rank</th>
                    <th className="px-4 py-3 text-left font-medium">Wallet</th>
                    <th className="px-4 py-3 text-left font-medium">Points</th>
                    <th className="px-4 py-3 text-left font-medium">Predictions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry) => (
                    <tr key={entry.rank} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 text-left">{entry.rank}</td>
                      <td className="px-4 py-3 text-left">{entry.wallet}</td>
                      <td className="px-4 py-3 text-left font-medium">{entry.points}</td>
                      <td className="px-4 py-3 text-left">{entry.predictions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  );
} 