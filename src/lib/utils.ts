import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Decimal } from "decimal.js";
import BN from "bn.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (walletAddress: string, len = 4) => {
  return walletAddress.slice(0, len) + "..." + walletAddress.slice(-len);
};

export const toUiAmount = (amount: BN | bigint | number | string, decimals = 9): number => {
  return new Decimal(amount.toString()).div(new Decimal(10).pow(decimals)).toNumber();
};

export const generateHeliusRpcUrl = (): string => {
  const cluster = process.env.HELIUS_CLUSTER;
  const apiKey = process.env.HELIUS_API_KEY;

  if (!cluster || !apiKey) {
    throw new Error("Missing HELIUS_CLUSTER or HELIUS_API_KEY in environment variables.");
  }

  const heliusCluster = cluster === "mainnet-beta" ? "mainnet" : "devnet";

  return `https://${heliusCluster}.helius-rpc.com/?api-key=${apiKey}`;
};
