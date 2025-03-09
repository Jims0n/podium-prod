"use client"
import React, { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { SolanaWalletProvider } from "./SolanaWalletProvider";
import { Toaster } from "../ui/sonner";
import ClientOnly from "../utils/ClientOnly";

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ClientOnly fallback={<div className="min-h-screen bg-background"></div>}>
        <SolanaWalletProvider>
          <Toaster richColors position="bottom-right" />
          {children}
        </SolanaWalletProvider>
      </ClientOnly>
    </ThemeProvider>
  );
};
