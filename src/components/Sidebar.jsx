import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppContext } from "./provider";

const NAV_GROUPS = [
  {
    key: "markets",
    label: "Markets",
    items: [
      { path: "/", label: "Dashboard", icon: "◈" },
      { path: "/leaderboard", label: "Leaderboard", icon: "◉" },
      { path: "/new-launches", label: "New Launches", icon: "◎" },
      { path: "/fastest-growing", label: "Fastest Growing", icon: "▲" },
      { path: "/profitable", label: "Most Profitable", icon: "◉" },
      { path: "/graduating", label: "Graduating", icon: "⬆" },
    ],
  },
  {
    key: "alpha",
    label: "Alpha",
    items: [
      { path: "/organic", label: "Organic Trades", icon: "◍" },
      { path: "/smart-money", label: "Smart Money", icon: "◆" },
      { path: "/dev-leaderboard", label: "Dev Leaderboard", icon: "◬" },
      { path: "/ruggers", label: "Rugger Radar", icon: "⚠" },
      { path: "/whales", label: "Whale Watch", icon: "◆" },
      { path: "/dumpers", label: "Dump Detector", icon: "▼" },
    ],
  },
  {
    key: "live",
    label: "Live",
    items: [
      { path: "/trending", label: "Trending Now", icon: "🔥" },
      { path: "/copy-trade", label: "Copy-Trade Feed", icon: "⟳" },
    ],
  },
  {
    key: "social",
    label: "Social",
    items: [
      { path: "/community", label: "CT Buzz", icon: "◈" },
      { path: "/portfolio", label: "My Portfolio", icon: "◈" },
    ],
  },
  {
    key: "tools",
    label: "Tools",
    items: [
      { path: "/watchlist", label: "Watchlist", icon: "★" },
      { path: "/compare", label: "Compare Tokens", icon: "⇄" },
    ],
  },
];

const LS_KEY = "coineye-sidebar-groups";

function loadOpenGroups() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set(NAV_GROUPS.map((g) => g.key));
}

function saveOpenGroups(groups) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...groups])); } catch {}
}

export function Sidebar() {
  const router = useRouter();
  const location = router.pathname;
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const [openGroups, setOpenGroups] = useState(() => new Set(NAV_GROUPS.map((g) => g.key)));

  useEffect(() => {
    setOpenGroups(loadOpenGroups());
  }, []);

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((g) =>
      g.items.some((item) => item.path === location || (item.path !== "/" && location.startsWith(item.path)))
    );
    if (activeGroup) {
      setOpenGroups((prev) => {
        if (prev.has(activeGroup.key)) return prev;
        const next = new Set(prev);
        next.add(activeGroup.key);
        saveOpenGroups(next);
        return next;
      });
    }
  }, [location]);

  const toggleGroup = useCallback((key) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveOpenGroups(next);
      return next;
    });
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{ display: "none", position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.65)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className="sidebar"
        style={{
          width: sidebarOpen ? 224 : 50,
          minWidth: sidebarOpen ? 224 : 50,
          transition: "width 0.2s ease, min-width 0.2s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Logo + toggle */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding: sidebarOpen ? "14px 14px 12px" : "14px 0 12px",
          borderBottom: "1px solid var(--border)", gap: 8, minHeight: 52,
        }}>
          {sidebarOpen && (
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--accent)", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                CoinEye
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 14, padding: "4px", lineHeight: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "◂" : "▸"}
          </button>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, paddingTop: 4, overflowY: "auto", overflowX: "hidden" }}>
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.key);
            const hasActive = group.items.some((item) =>
              item.path === location || (item.path !== "/" && location.startsWith(item.path))
            );
            return (
              <div key={group.key}>
                {sidebarOpen ? (
                  <button
                    onClick={() => toggleGroup(group.key)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px 5px", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: hasActive ? "var(--accent)" : "var(--text-faint)" }}>
                      {group.label}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--text-faint)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
                  </button>
                ) : (
                  <div style={{ height: 6, borderTop: "1px solid var(--border)", marginTop: 4 }} />
                )}
                <div style={{ overflow: "hidden", maxHeight: (!sidebarOpen || isOpen) ? "999px" : "0px", transition: sidebarOpen ? "max-height 0.22s ease" : "none" }}>
                  {group.items.map(({ path, label, icon }) => {
                    const active = location === path || (path !== "/" && location.startsWith(path));
                    return (
                      <Link key={path} href={path}>
                        <div
                          title={!sidebarOpen ? label : undefined}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: sidebarOpen ? "7px 14px" : "8px 0",
                            justifyContent: sidebarOpen ? "flex-start" : "center",
                            cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                            fontWeight: active ? 600 : 400,
                            color: active ? "var(--accent)" : "var(--text-muted)",
                            background: active ? "var(--accent-dim)" : "transparent",
                            borderLeft: active && sidebarOpen ? "2px solid var(--accent)" : "2px solid transparent",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-hover)"; } }}
                          onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; } }}
                        >
                          <span style={{ fontSize: 12, flexShrink: 0, width: 14, textAlign: "center", opacity: active ? 1 : 0.7 }}>{icon}</span>
                          {sidebarOpen && (
                            <>
                              <span>{label}</span>
                              {active && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Data</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "'JetBrains Mono', monospace" }}>
              Powered by{" "}
              <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>bags.fm</a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
