"use client";

import React, { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import { PublicKey, TokenAccountBalancePair } from "@solana/web3.js";

import { cn, toU64Amount } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import WalletConnectButton from "@/components/WalletConnectButton";
import { AnchorEscrow } from "@/types/anchor_escrow";
import { Escrow, EscrowActionType, TokenMeta } from "@/types";
import EscrowList from "@/sections/escrow/list";
import idl from "@/idl/anchor_escrow.json";
import EscrowCreate from "@/sections/escrow/create";

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
  const [metadata, setMetadata] = useState<Map<string, TokenMeta>>(new Map());
  const [balances, setBalances] = useState<TokenAccountBalancePair[]>();

  const fetchTokenMetadata = async (addresses: string[]) => {
    try {
      const response = await fetch("/api/token-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses }),
      });

      const data = await response.json();
      data.tokens.forEach((token: TokenMeta) =>
        setMetadata((map) => new Map(map.set(token.address, token)))
      );
    } catch (error) {
      console.error("Error fetching batch token details:", error);
    }
  };

  const fetchEscrow = async () => {
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
          initializerAmount: escrow.account.initializerAmount.toNumber(),
          mintA: escrow.account.mintA.toBase58(),
          mintB: escrow.account.mintB.toBase58(),
          takerAmount: escrow.account.takerAmount.toNumber(),
        }))
      );

      fetchTokenMetadata(
        data.flatMap((escrow) => [escrow.account.mintA.toBase58(), escrow.account.mintB.toBase58()])
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async (mintA: PublicKey, mintB: PublicKey, amountA: BN, amountB: BN) => {
    if (!wallet) {
      console.error("Wallet not connected.");
      return null;
    }

    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(idl as AnchorEscrow, provider);

      const seed = new BN(randomBytes(8).readUInt32BE());
      const tx = await program.methods
        .initialize(seed, amountA, amountB)
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
    await fetchEscrow();
  };

  console.log({
    metadata,
  });
  const handleCreate = async ({
    inputToken,
    outputToken,
    amountIn,
    amountOut,
  }: {
    inputToken: string;
    outputToken: string;
    amountIn: number;
    amountOut: number;
  }) => {
    const inputTokenMeta = metadata.get(inputToken);
    const outputTokenMeta = metadata.get(outputToken);

    if (!inputTokenMeta || !outputTokenMeta) return;

    const amountInU64 = toU64Amount(amountIn, inputTokenMeta.decimals);
    const amountOutU64 = toU64Amount(amountOut, outputTokenMeta.decimals);

    await createEscrow(
      new PublicKey(inputToken),
      new PublicKey(outputToken),
      amountInU64,
      amountOutU64
    );
    await fetchEscrow();
  };

  useEffect(() => {
    fetchEscrow();
  }, [connection]);

  useEffect(() => {
    (async () => {
      if (publicKey) {
        try {
          const response = await fetch("/api/token-balances", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ address: publicKey.toBase58() }),
          });

          const data = await response.json();
          const balances: TokenAccountBalancePair[] = data.balances.map(
            (balance: TokenAccountBalancePair) => ({
              ...balance,
              address: new PublicKey(balance.address),
            })
          );
          setBalances(balances);

          const tokens = balances
            .filter((balance) => !metadata.get(balance.address.toBase58()))
            .map((balance) => balance.address.toBase58());
          fetchTokenMetadata(tokens);
        } catch (error) {
          console.error("Error fetching batch token balances:", error);
        }
      }
    })();
  }, [connection, publicKey]);

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
          <EscrowCreate loading={loading} onCreate={handleCreate} metadata={metadata} />
          <EscrowList data={data} loading={loading} onAction={handleAction} metadata={metadata} />
        </div>
      </div>
    </div>
  );
}
