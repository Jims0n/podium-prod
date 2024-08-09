import React from "react";
import ThemeToogle from "../ThemeToogle";
import ConnectWalletButton from "../ConnectWalletButton";

export default function EndNavbarSection() {
  return (
    <div className="flex items-center gap-2">
      <ConnectWalletButton />
      <ThemeToogle />
    </div>
  );
}
