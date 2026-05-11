import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { TokenTable } from "../src/components/TokenRow";

const LS_KEY = "coineye-watchlist";

function loadWatchlist() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveWatchlist(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [addInput, setAddInput] = useState("");

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  const removeToken = (mint) => {
    const next = watchlist.filter((m) => m !== mint);
    setWatchlist(next);
    saveWatchlist(next);
  };

  const addToken = () => {
    const mint = addInput.trim();
    if (!mint || watchlist.includes(mint)) return;
    const next = [...watchlist, mint];
    setWatchlist(next);
    saveWatchlist(next);
    setAddInput("");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["watchlist-tokens", watchlist],
    enabled: watchlist.length > 0,
    queryFn: async () => {
      const r = await fetch("/api/tokens/leaderboard");
      const j = await r.json();
      const all = Array.isArray(j?.leaderboard) ? j.leaderboard : [];
      return all.filter((t) => watchlist.includes(t.mint));
    },
  });

  const tokens = (data ?? []).map((t, i) => ({
    rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
    price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
    marketCap: t.marketCap, image: t.image,
  }));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ★ <span style={{ color: "var(--accent)" }}>Watchlist</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Track your favorite tokens</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          className="search-input"
          style={{ maxWidth: 340 }}
          placeholder="Paste token mint address..."
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addToken(); }}
        />
        <button className="btn btn-primary btn-sm" onClick={addToken}>+ Add</button>
      </div>
      {watchlist.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, border: "1px solid var(--border)" }}>
          Your watchlist is empty — paste a token mint address above to add tokens
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <TokenTable
              tokens={tokens}
              columns={["rank", "name", "price", "change", "volume", "mcap"]}
              loading={isLoading}
              emptyMsg="Token data loading or not found in leaderboard"
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {watchlist.map((mint) => (
              <div key={mint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                <Link href={`/token/${mint}`}><span style={{ cursor: "pointer", color: "var(--accent)" }}>{mint.slice(0, 8)}…{mint.slice(-4)}</span></Link>
                <button onClick={() => removeToken(mint)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
