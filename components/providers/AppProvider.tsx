import React, { PropsWithChildren } from "react";
import SolanaProvider from "./SolanaProvider";
import AppThemeProvider from "./AppThemeProvider";
import { Toaster } from "../ui/sonner";

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <SolanaProvider>
      <Toaster richColors position="bottom-right" />
      <AppThemeProvider>{children}</AppThemeProvider>
    </SolanaProvider>
  );
};
