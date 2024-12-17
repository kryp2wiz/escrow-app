import { FAILOVER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export interface TokenLogoProps {
  className?: string;
  url?: string;
  alt?: string;
  size?: number;
}

export default function TokenLogo({
  className = "",
  url = FAILOVER_IMAGE,
  alt = "Unknown Token",
  size = 6,
}: TokenLogoProps) {
  return (
    <div
      className={cn(className, "overflow-hidden rounded-full")}
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
      }}
    >
      <Image
        unoptimized
        src={url}
        alt={alt}
        width={size * 4}
        height={size * 4}
        className="min-w-ful inset-0 min-h-full"
      />
    </div>
  );
}
