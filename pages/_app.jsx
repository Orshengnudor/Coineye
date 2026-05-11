import dynamic from "next/dynamic";
import "../src/styles/globals.css";

// Load provider client-side only — solana/privy use browser APIs
const ClientApp = dynamic(() => import("../src/components/ClientApp"), { ssr: false });

export default function App({ Component, pageProps }) {
  return <ClientApp Component={Component} pageProps={pageProps} />;
}
