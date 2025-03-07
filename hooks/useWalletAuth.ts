"use client"
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export function useWalletAuth() {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
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