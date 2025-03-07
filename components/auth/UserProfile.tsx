import { FC } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserProfileProps {
  className?: string;
}

const UserProfile: FC<UserProfileProps> = ({ className }) => {
  const { publicKey, logout } = useWalletAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully disconnected wallet');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error(error);
    }
  };

  if (!publicKey) return null;

  const walletAddress = publicKey.toString();
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-card ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
          </svg>
        </div>
        <div>
          <h3 className="font-medium">Connected Wallet</h3>
          <p className="text-sm text-muted-foreground">{shortAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/predictions">Predictions</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="col-span-2 border-destructive text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          Disconnect Wallet
        </Button>
      </div>
    </div>
  );
};

export default UserProfile; 