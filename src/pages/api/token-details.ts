import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

import { generateHeliusRpcUrl } from "@/lib/utils";
import { TokenMeta } from "@/types";

const connection = new Connection(generateHeliusRpcUrl(), "finalized");
const metaplex = Metaplex.make(connection);

const tokenCache: Map<string, { data: TokenMeta; timestamp: number }> = new Map();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

async function fetchTokenDetails(mintAddress: string): Promise<TokenMeta | null> {
  const now = Date.now();
  const cachedToken = tokenCache.get(mintAddress);
  if (cachedToken && now - cachedToken.timestamp < CACHE_DURATION_MS) {
    return cachedToken.data;
  }

  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const nftMetadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

    if (!nftMetadata.uri) {
      console.warn(`Metadata URI not found for token: ${mintAddress}`);
      return null;
    }

    const metadataResponse = await axios.get(nftMetadata.uri);
    const metadataJSON = metadataResponse.data;

    const tokenDetails: TokenMeta = {
      address: mintAddress,
      decimals: nftMetadata.mint.decimals || 0,
      name: metadataJSON.name || nftMetadata.name || "Unknown Token",
      symbol: metadataJSON.symbol || nftMetadata.symbol || "UNKNOWN",
      image: metadataJSON.image || "",
    };

    tokenCache.set(mintAddress, { data: tokenDetails, timestamp: now });

    return tokenDetails;
  } catch (error) {
    console.error(
      `Error fetching details for mint address ${mintAddress}: ${(error as Error).message}`
    );
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { addresses } = req.body;

  if (!Array.isArray(addresses) || addresses.length === 0) {
    return res.status(400).json({
      error: "Invalid or missing `addresses`. Provide an array of mint addresses.",
    });
  }

  try {
    const tokens = await Promise.all(
      addresses.map(async (mintAddress) => await fetchTokenDetails(mintAddress))
    );

    return res.status(200).json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error("Error processing batch request:", error);
    return res.status(500).json({
      error: "Failed to process batch request.",
      details: error instanceof Error ? error.message : "Unknown error occurred.",
    });
  }
}
