import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WalletConnectButtonProps {
  className?: string;
}

const WalletConnectButton: FC<WalletConnectButtonProps> = ({ className }) => {
  const { connected, publicKey, disconnect } = useWallet();

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error(error);
    }
  };

  if (connected && publicKey) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('wallet-adapter-container', className)}>
      <WalletMultiButton className="wallet-adapter-button-custom" />
      <style jsx global>{`
        .wallet-adapter-button-custom {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          font-family: inherit !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          height: 40px !important;
          padding: 0 16px !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }
        .wallet-adapter-button-custom:hover {
          background-color: hsl(var(--primary) / 0.9) !important;
        }
        .wallet-adapter-button-custom .wallet-adapter-button-start-icon {
          margin-right: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton; 