"use client";

import React, { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TokenMeta } from "@/types";
import TokenLogo from "@/components/TokenLogo";
import { Input } from "@/components/ui/input";

export interface EscrowCreateProps {
  loading: boolean;
  onCreate: (v: {
    inputToken: string;
    outputToken: string;
    amountIn: number;
    amountOut: number;
  }) => void;
  metadata: Map<string, TokenMeta>;
}

const EscrowCreate = ({ loading, onCreate, metadata }: EscrowCreateProps) => {
  const [inputToken, setInputToken] = useState<string>();
  const [outputToken, setOutputToken] = useState<string>();
  const [amountIn, setAmountIn] = useState<number>(0);
  const [amountOut, setAmountOut] = useState<number>(0);

  const disabled = !(inputToken && outputToken && amountIn > 0 && amountOut > 0);

  const handleCreate = () => {
    if (!disabled)
      onCreate({
        inputToken,
        outputToken,
        amountIn,
        amountOut,
      });
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-md">Need to create new Escrow?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={inputToken} onValueChange={(v) => setInputToken(v)} disabled={loading}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(metadata, ([_, value]) => value).map((meta) => (
                    <SelectItem value={meta.address} key={meta.address}>
                      <div className="flex items-center gap-2">
                        <TokenLogo url={meta.image} alt={meta.symbol} />
                        <span>{meta.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={amountIn}
                onChange={(e) => setAmountIn(Number(e.target.value))}
                type="number"
                className="max-w-[200px]"
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={outputToken}
                onValueChange={(v) => setOutputToken(v)}
                disabled={loading}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(metadata, ([_, value]) => value).map((meta) => (
                    <SelectItem value={meta.address} key={meta.address}>
                      <div className="flex items-center gap-2">
                        <TokenLogo url={meta.image} alt={meta.symbol} />
                        <span>{meta.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={amountOut}
                onChange={(e) => setAmountOut(Number(e.target.value))}
                type="number"
                className="max-w-[200px]"
                placeholder="0"
                disabled={loading}
              />
            </div>

            <Button onClick={handleCreate} disabled={disabled || loading}>
              Create Escrow
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EscrowCreate;
