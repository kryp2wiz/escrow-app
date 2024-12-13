import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import Web3Provider from "./Web3Provider";

const Providers = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <Web3Provider>{children}</Web3Provider>
    </ThemeProvider>
  );
};

export default Providers;
