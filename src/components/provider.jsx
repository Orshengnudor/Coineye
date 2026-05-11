import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmozrtbv602mn0cl42d8k5f7t";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 60_000,
      retry: 1,
    },
  },
});

const AppContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  wallet: null,
  setWallet: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

function InnerProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [wallet, setWallet] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("coineye-theme");
    if (saved) setTheme(saved);
    const savedWallet = localStorage.getItem("coineye-wallet");
    if (savedWallet) setWallet(savedWallet);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("coineye-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleSetWallet = (w) => {
    setWallet(w);
    if (w) localStorage.setItem("coineye-wallet", w);
    else localStorage.removeItem("coineye-wallet");
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, wallet, setWallet: handleSetWallet, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function Provider({ children }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#00ff41",
          },
          loginMethods: ["twitter", "wallet", "email"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <InnerProvider>
                {children}
              </InnerProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
