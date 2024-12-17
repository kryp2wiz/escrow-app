import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["gateway.pinata.cloud"], // Add external domains here
  },
};

export default nextConfig;
