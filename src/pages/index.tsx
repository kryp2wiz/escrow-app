"use client";

import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import WalletConnectButton from "@/components/WalletConnectButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "flex min-h-screen bg-background p-8 antialiased"
      )}
    >
      <div className="w-full flex-1 flex-col space-y-8 overflow-hidden rounded-[0.5rem] border p-4 shadow md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">Anchor Escrow</h2>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
