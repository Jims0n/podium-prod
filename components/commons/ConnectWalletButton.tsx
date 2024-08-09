"use client";
import React from "react";
import dynamic from "next/dynamic";
require("@solana/wallet-adapter-react-ui/styles.css");
export const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
type Props = {};

const ConnectWalletButton: React.FC<Props> = ({}) => {
  return (
    <WalletMultiButtonDynamic
      style={{
        height: "40px",
        borderRadius: "5px",
      }}
    />
  );
};

export default ConnectWalletButton;
