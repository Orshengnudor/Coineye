import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "./provider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePrivy } from "@privy-io/react-auth";

export function Topbar() {
  const { theme, toggleTheme, setWallet, setSidebarOpen } = useAppContext();
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { login, logout, authenticated, user } = usePrivy();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);
  const authRef = useRef(null);

  useEffect(() => {
    if (connected && publicKey) setWallet(publicKey.toBase58());
    else setWallet(null);
  }, [connected, publicKey]);

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/stats");
      return res.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tokens/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch {}
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (authRef.current && !authRef.current.contains(e.target)) setShowAuthMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
    : null;

  const privyName = user?.twitter?.username
    ? `@${user.twitter.username}`
    : user?.email?.address
    ? user.email.address.split("@")[0]
    : null;

  return (
    <div className="topbar">
      <button className="hamburger-btn" onClick={() => setSidebarOpen((o) => !o)}>☰</button>

      {/* Search */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 400 }}>
        <input
          className="search-input"
          placeholder="Search token, mint address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: 12 }}
        />
        {showResults && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((t) => (
              <div key={t.mint} className="search-result-row"
                onClick={() => { router.push(`/token/${t.mint}`); setSearch(""); setShowResults(false); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t.image && <img src={t.image} alt="" style={{ width: 18, height: 18 }} onError={(e) => { e.target.style.display = "none"; }} />}
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>${t.symbol}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 11, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>
                  {(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(+(t.priceChange24h ?? 0)).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button className="filter-pill" onClick={toggleTheme} title="Toggle theme" style={{ padding: "5px 10px" }}>
        {theme === "dark" ? "◐" : "◑"}
      </button>

      {/* Auth area */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {authenticated && privyName ? (
          <div ref={authRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowAuthMenu((m) => !m)}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "5px 10px", background: "rgba(29,161,242,0.1)", border: "1px solid #1DA1F2", color: "#1DA1F2", cursor: "pointer" }}
            >
              {user?.twitter ? "𝕏" : "✉"} {privyName}
            </button>
            {showAuthMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "var(--surface)", border: "1px solid var(--border)", minWidth: 140, zIndex: 100 }}>
                <button onClick={() => { logout(); setShowAuthMenu(false); }}
                  style={{ display: "block", width: "100%", padding: "8px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="filter-pill" onClick={() => login()} style={{ fontSize: 10, padding: "5px 10px", color: "#1DA1F2", borderColor: "#1DA1F2", whiteSpace: "nowrap" }}>
            𝕏 Login
          </button>
        )}

        {connected && shortKey ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="wallet-badge" onClick={() => router.push("/portfolio")} title="View portfolio">{shortKey}</span>
            <button onClick={() => disconnect()} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 12 }} title="Disconnect">✕</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => setVisible(true)} style={{ whiteSpace: "nowrap" }}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
