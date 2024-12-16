"use client";

import React, { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import { PublicKey } from "@solana/web3.js";

import { cn, toUiAmount } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import WalletConnectButton from "@/components/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { AnchorEscrow } from "@/types/anchor_escrow";
import { Escrow, EscrowActionType } from "@/types";
import EscrowList from "@/sections/escrow/list";
import idl from "@/idl/anchor_escrow.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Escrow[]>();

  const fetch = async () => {
    if (loading) return;
    if (!connection) return;
    try {
      setLoading(true);
      const program = new Program(idl as AnchorEscrow, { connection });
      const data = await program.account.escrow.all();
      setData(
        data.map((escrow) => ({
          address: escrow.publicKey.toBase58(),
          initializer: escrow.account.initializer.toBase58(),
          initializerAmount: toUiAmount(escrow.account.initializerAmount),
          mintA: escrow.account.mintA.toBase58(),
          mintB: escrow.account.mintB.toBase58(),
          takerAmount: toUiAmount(escrow.account.takerAmount),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async () => {
    if (!wallet) {
      console.error("Wallet not connected.");
      return null;
    }

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(idl as AnchorEscrow, provider);

      const seed = new BN(randomBytes(8).readUInt32BE());
      const initializerAmount = 1000;
      const takerAmount = 1000;

      const mintA = new PublicKey("6Zu4xnSUMh8hdeyJhmxkM9E6di7r66bTqXESpHQH4mh4");
      const mintB = new PublicKey("Egtnbm9kQsCvyGZ1bVTKx1pDYAaDtCz93u9SpZcuh2UK");

      const tx = await program.methods
        .initialize(seed, new BN(initializerAmount), new BN(takerAmount))
        .accounts({
          mintA,
          mintB,
        })
        .rpc();

      console.log("Created escrow with transaction ID:", tx);
    } catch (err) {
      console.error("Error creating escrow:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeEscrow = async (escrow: Escrow) => {
    if (!wallet) {
      console.error("Wallet not connected.");
      return null;
    }

    try {
      setLoading(true);
      console.log("Closing escrow:", escrow);

      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(idl as AnchorEscrow, provider);

      const tx = await program.methods
        .cancel()
        .accounts({
          escrow: new PublicKey(escrow.address),
        })
        .rpc();

      console.log("Escrow closed with transaction ID:", tx);
    } catch (err) {
      console.error("Error closing escrow:", err);
    } finally {
      setLoading(false);
    }
  };

  const acceptEscrow = async (escrow: Escrow) => {
    if (!wallet) {
      console.error("Wallet not connected.");
      return null;
    }

    try {
      setLoading(true);
      console.log("Accepting escrow:", escrow);

      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(idl as AnchorEscrow, provider);

      const tx = await program.methods
        .exchange()
        .accounts({
          initializer: new PublicKey(escrow.initializer),
          mintA: new PublicKey(escrow.mintA),
          taker: wallet.publicKey,
          escrow: new PublicKey(escrow.address),
        })
        .rpc();

      console.log("Escrow closed with transaction ID:", tx);
    } catch (err) {
      console.error("Error closing escrow:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: EscrowActionType, escrow: Escrow) => {
    if (type === EscrowActionType.ACCEPT) {
      if (publicKey?.toBase58() !== escrow.initializer) await acceptEscrow(escrow);
      else console.warn("You cannot accept an escrow you created.");
    } else if (type === EscrowActionType.CLOSE) {
      if (publicKey?.toBase58() === escrow.initializer) await closeEscrow(escrow);
      else console.warn("You cannot close an escrow you did not create.");
    }
    await fetch();
  };

  const handleCreate = async () => {
    await createEscrow();
    await fetch();
  };

  useEffect(() => {
    fetch();
  }, [connection]);

  return (
    <div
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "flex min-h-screen bg-background p-8 antialiased"
      )}
    >
      <div className="w-full flex-1 flex-col space-y-8 overflow-hidden rounded-[0.5rem] border p-6 shadow md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Anchor Escrow</h2>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <WalletConnectButton />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <Button onClick={handleCreate} disabled={loading}>
              Create Escrow
            </Button>
          </div>
          <EscrowList data={data} loading={loading} onAction={handleAction} />
        </div>
      </div>
    </div>
  );
}
