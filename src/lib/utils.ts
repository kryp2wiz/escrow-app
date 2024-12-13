import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (walletAddress: string, len = 4) => {
  return walletAddress.slice(0, len) + "..." + walletAddress.slice(-len);
};
