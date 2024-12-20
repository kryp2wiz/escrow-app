import { NextApiRequest, NextApiResponse } from "next";
import Decimal from "decimal.js";
import { PublicKey, TokenAccountBalancePair } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import { RpcResponse, SearchAssetsResponse } from "@/types/helius";
import { generateHeliusRpcUrl, toUiAmount } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Missing wallet address" });
    }

    const response = await fetch(generateHeliusRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: address,
        method: "searchAssets",
        params: {
          ownerAddress: address,
          tokenType: "fungible",
          displayOptions: {
            showCollectionMetadata: false,
            showGrandTotal: false,
            showNativeBalance: true,
            showInscription: false,
            showZeroBalance: false,
          },
        },
      }),
    });

    const { result } = (await response.json()) as RpcResponse<SearchAssetsResponse>;
    if (!result) {
      return res.status(500).json({ error: "Failed to fetch balances" });
    }

    const balances = result.items.map<TokenAccountBalancePair>((item) => {
      const uiAmount = toUiAmount(item.token_info.balance, item.token_info.decimals);
      return {
        address: new PublicKey(item.id),
        amount: item.token_info.balance.toString(),
        decimals: item.token_info.decimals,
        uiAmountString: String(uiAmount),
        uiAmount: uiAmount,
      };
    });

    if (result.nativeBalance?.lamports) {
      const wrappedSOL = balances.find((balance) => balance.address.equals(NATIVE_MINT));
      const uiAmountString = String(toUiAmount(result.nativeBalance.lamports));

      if (wrappedSOL) {
        const newUiAmount = new Decimal(wrappedSOL.uiAmountString!)
          .add(new Decimal(uiAmountString))
          .toDP(9);
        wrappedSOL.amount = new Decimal(wrappedSOL.amount)
          .add(new Decimal(result.nativeBalance.lamports))
          .toString();
        wrappedSOL.uiAmountString = newUiAmount.toString();
        wrappedSOL.uiAmount = newUiAmount.toNumber();
      } else {
        balances.push({
          address: NATIVE_MINT,
          amount: result.nativeBalance.lamports.toString(),
          decimals: 9,
          uiAmountString,
          uiAmount: Number(uiAmountString),
        });
      }
    }

    return res.status(200).json({ balances });
  } catch (error) {
    console.error("Error fetching balances:", (error as Error).message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
