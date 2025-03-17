import React from 'react';
import { ExternalLink } from 'lucide-react';

interface NetworkInfoProps {
  network: 'solana' | 'sonic';
}

export default function NetworkInfo({ network }: NetworkInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-2">
        {network === 'solana' ? '' : 'Sonic SVM Network'}
      </h3>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
        {network === 'solana' ? (
         <></>
        ) : (
          <>
            <p>
              Minting on Sonic SVM Testnet using regular NFTs.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <a 
                href="https://faucet.sonic.game/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded"
              >
                Sonic Faucet <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a 
                href="https://explorer.sonic.game/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded"
              >
                Sonic Explorer <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a 
                href="https://docs.sonic.game/developers/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded"
              >
                Sonic Docs <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 