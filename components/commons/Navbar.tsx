"use client"
import Link from "next/link";
import { cn } from "@/lib/utils";
import WalletConnectButton from "./WalletConnectButton";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import ClientOnly from "../utils/ClientOnly";
import Logo from "./Logo";

const Navbar = () => {
  const { isAuthenticated } = useWalletAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Logo />
          <ClientOnly>
            <nav className="flex gap-6">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center text-sm font-medium text-muted-foreground",
                      "hover:text-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={cn(
                      "flex items-center text-sm font-medium text-muted-foreground",
                      "hover:text-foreground"
                    )}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/predictions"
                    className={cn(
                      "flex items-center text-sm font-medium text-muted-foreground",
                      "hover:text-foreground"
                    )}
                  >
                    Predictions
                  </Link>
                </>
              )}
            </nav>
          </ClientOnly>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ClientOnly>
            <WalletConnectButton />
          </ClientOnly>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 