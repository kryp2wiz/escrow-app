import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

import "@/styles/globals.css";

const DynamicProviders = dynamic(() => import("@/provider"));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicProviders>
      <Component {...pageProps} />
    </DynamicProviders>
  );
}
