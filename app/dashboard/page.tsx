"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { toast } from 'sonner';
import UserProfile from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ClientOnly from '@/components/utils/ClientOnly';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, publicKey } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please connect your wallet to access your dashboard');
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
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <UserProfile />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-bold mb-4">Your Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Correct Predictions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity to display</p>
                  <p className="mt-2 text-sm">Make your first prediction to get started!</p>
                  <Button asChild className="mt-4">
                    <Link href="/predictions">Make Predictions</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  );
} 