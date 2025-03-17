"use client"
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export function useWalletAuth() {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure wallet state is properly initialized
    const timer = setTimeout(() => {
      if (connected && publicKey) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [connected, publicKey]);

  // Force update authentication state when wallet connects/disconnects
  useEffect(() => {
    if (connected && publicKey) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [connected, publicKey]);

  const logout = async () => {
    await disconnect();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    wallet,
    publicKey,
    logout,
  };
} 