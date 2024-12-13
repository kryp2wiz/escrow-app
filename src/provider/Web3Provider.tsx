"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo } from "react";

export default function Web3Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const network =
    process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_HELIUS_RPC_URL) return process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
