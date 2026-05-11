import React from "react";
import { Provider } from "./provider";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClientApp({ Component, pageProps }) {
  return (
    <Provider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </Provider>
  );
}
