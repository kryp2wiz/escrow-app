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
