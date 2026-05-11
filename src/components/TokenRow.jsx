import React from "react";
import Link from "next/link";

export function fmt(n, prefix = "", suffix = "") {
  if (n === undefined || n === null) return "—";
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (!isFinite(num) || isNaN(num)) return "—";
  if (Math.abs(num) >= 1_000_000_000) return prefix + (num / 1_000_000_000).toFixed(2) + "B" + suffix;
  if (Math.abs(num) >= 1_000_000) return prefix + (num / 1_000_000).toFixed(2) + "M" + suffix;
  if (Math.abs(num) >= 1_000) return prefix + (num / 1_000).toFixed(1) + "K" + suffix;
  if (Math.abs(num) < 0.0001 && num !== 0) return prefix + num.toExponential(2) + suffix;
  return prefix + num.toFixed(4) + suffix;
}

const DEFAULT_COLS = ["rank", "name", "price", "change", "volume", "mcap"];

export function TokenRow({ token, columns = DEFAULT_COLS, highlight }) {
  if (!token || !token.symbol) return null;
  const change = typeof token.priceChange24h === "string" ? parseFloat(token.priceChange24h) : (token.priceChange24h ?? 0);
  const changeColor = !change ? "var(--text-muted)" : change >= 0 ? "var(--accent)" : "var(--red)";
  const sign = change > 0 ? "+" : "";

  const cell = (col) => {
    switch (col) {
      case "rank":
        return (
          <td key="rank" style={{ padding: "9px 10px", width: 42, textAlign: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }}>
              {token.rank ?? "—"}
            </span>
          </td>
        );
      case "name":
        return (
          <td key="name" style={{ padding: "9px 12px", minWidth: 160 }}>
            <Link href={token.mint ? `/token/${token.mint}` : "#"}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
                {token.image ? (
                  <img src={token.image} alt={token.symbol} style={{ width: 26, height: 26, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div style={{ width: 26, height: 26, background: "var(--surface-raised)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>
                    {token.symbol.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: "var(--text)" }} className="token-symbol">
                    ${token.symbol}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                    {token.name}
                  </div>
                </div>
              </div>
            </Link>
          </td>
        );
      case "price":
        return (
          <td key="price" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>
              {fmt(token.price, "$")}
            </span>
          </td>
        );
      case "change":
        return (
          <td key="change" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: changeColor, fontWeight: 600,
              background: change ? (change >= 0 ? "var(--accent-dim)" : "var(--red-dim)") : "transparent",
              padding: "2px 6px", display: "inline-block",
            }}>
              {token.priceChange24h !== undefined && token.priceChange24h !== null
                ? `${sign}${change.toFixed(2)}%` : "—"}
            </span>
          </td>
        );
      case "volume":
        return (
          <td key="volume" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
              {fmt(token.volume24h, "$")}
            </span>
          </td>
        );
      case "mcap":
        return (
          <td key="mcap" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
              {fmt(token.marketCap, "$")}
            </span>
          </td>
        );
      case "liquidity":
        return (
          <td key="liquidity" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
              {fmt(token.liquidity, "$")}
            </span>
          </td>
        );
      case "holders":
        return (
          <td key="holders" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
              {fmt(token.holders)}
            </span>
          </td>
        );
      case "age":
        return (
          <td key="age" style={{ padding: "9px 12px", textAlign: "right" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)" }}>
              {token.age ?? "—"}
            </span>
          </td>
        );
      case "score":
        return (
          <td key="score" style={{ padding: "9px 12px", textAlign: "right", minWidth: 80 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 44, height: 3, background: "var(--border)", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${(token.score ?? 0)}%`,
                  background: (token.score ?? 0) >= 70 ? "var(--accent)" : (token.score ?? 0) >= 40 ? "var(--yellow)" : "var(--red)",
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", minWidth: 24 }}>
                {token.score ?? 0}
              </span>
            </div>
          </td>
        );
      case "badge":
        return (
          <td key="badge" style={{ padding: "9px 12px", textAlign: "right" }}>
            {token.badge && (
              <span className="badge" style={{
                color: token.badgeColor ?? "var(--accent)",
                borderColor: token.badgeColor ? `${token.badgeColor}55` : "rgba(0,255,65,0.25)",
                background: token.badgeColor ? `${token.badgeColor}11` : "var(--accent-dim)",
              }}>
                {token.badge}
              </span>
            )}
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--border)",
        background: highlight ? "var(--accent-dim)" : "transparent",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = highlight ? "var(--accent-dim)" : "transparent")}
    >
      {columns.map((col) => cell(col))}
    </tr>
  );
}

const COL_LABELS = {
  rank: "#", name: "Token", price: "Price", change: "24h %",
  volume: "Volume", mcap: "Mkt Cap", liquidity: "Liquidity",
  holders: "Holders", age: "Age", score: "Score", badge: "",
};

export function TokenTable({ tokens, columns = DEFAULT_COLS, headers, loading, emptyMsg }) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
            {columns.map((col) => (
              <th key={col} style={{
                padding: "8px 12px",
                textAlign: col === "name" ? "left" : col === "rank" ? "center" : "right",
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                color: "var(--text-faint)", letterSpacing: "0.09em", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {(headers && headers[col]) ?? COL_LABELS[col] ?? col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                {columns.map((col) => (
                  <td key={col} style={{ padding: "10px 12px" }}>
                    <div className="skeleton" style={{ height: 11, width: col === "name" ? 130 : col === "rank" ? 20 : 55, opacity: 1 - i * 0.08 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : tokens.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-faint)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {emptyMsg ?? "No data"}
              </td>
            </tr>
          ) : (
            tokens.filter(Boolean).map((t, i) => (
              <TokenRow key={t.mint ?? `row-${i}`} token={t} columns={columns} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
