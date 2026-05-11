import {
  getTokenLaunchFeed,
  getTopTokensByLifetimeFees,
  getTokenCreators,
  getTokenLifetimeFees,
  getTokenClaimStats,
  computeRugScore,
  computeDevReputation,
} from "../../../src/lib/services/bags.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAge(ms) {
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return "<1h";
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

function ageMs(t) {
  if (!t.createdAt) return 0;
  return Date.now() - new Date(t.createdAt).getTime();
}

function vol24h(t) {
  return (t.stats24h?.buyVolume ?? 0) + (t.stats24h?.sellVolume ?? 0);
}

function priceChange(t, tf) {
  if (tf === "1h") return t.stats1h?.priceChange ?? 0;
  if (tf === "6h") return t.stats6h?.priceChange ?? 0;
  if (tf === "7d") return t.stats7d?.priceChange ?? 0;
  if (tf === "30d") return t.stats30d?.priceChange ?? 0;
  return t.stats24h?.priceChange ?? 0;
}

function organicBuyRatio(t) {
  const buyVol = t.stats24h?.buyVolume ?? 0;
  const organicBuy = t.stats24h?.buyOrganicVolume ?? 0;
  if (buyVol <= 0) return 0;
  return organicBuy / buyVol;
}

function mapToRow(t, rank) {
  const age = ageMs(t);
  const v24 = vol24h(t);
  const buys = t.stats24h?.numBuys ?? 0;
  const sells = t.stats24h?.numSells ?? 0;
  const total = buys + sells;
  const sellPressure = total > 0 ? parseFloat(((sells / total) * 100).toFixed(1)) : 0;
  const devRep = computeDevReputation(t);
  const primaryCreator = t.creators?.find((c) => c.isCreator) ?? t.creators?.[0];

  return {
    rank: rank ?? 0,
    mint: t.mint,
    symbol: t.symbol,
    name: t.name,
    image: t.image,
    price: t.price ?? 0,
    priceChange1h: t.stats1h?.priceChange ?? 0,
    priceChange6h: t.stats6h?.priceChange ?? 0,
    priceChange24h: t.stats24h?.priceChange ?? 0,
    priceChange7d: t.stats7d?.priceChange ?? 0,
    volume24h: v24,
    buyVolume24h: t.stats24h?.buyVolume ?? 0,
    sellVolume24h: t.stats24h?.sellVolume ?? 0,
    organicBuyVolume24h: t.stats24h?.buyOrganicVolume ?? 0,
    organicSellVolume24h: t.stats24h?.sellOrganicVolume ?? 0,
    organicRatio: parseFloat((organicBuyRatio(t) * 100).toFixed(1)),
    marketCap: t.mcap ?? t.fdv ?? 0,
    fdv: t.fdv ?? 0,
    liquidity: t.liquidity ?? 0,
    holderCount: t.holderCount ?? 0,
    holderChange24h: t.stats24h?.holderChange ?? 0,
    buys24h: buys,
    sells24h: sells,
    traders24h: t.stats24h?.numTraders ?? 0,
    netBuyers24h: t.stats24h?.numNetBuyers ?? 0,
    sellPressure,
    lifetimeFees: t.lifetimeFees ?? 0,
    feesUsd: t.feesUsd ?? 0,
    bondingCurve: t.bondingCurve ?? null,
    isGraduated: (t.bondingCurve ?? 0) >= 100,
    organicScore: t.organicScore ?? 0,
    organicScoreLabel: t.organicScoreLabel ?? "unknown",
    ctLikes: t.ctLikes ?? 0,
    smartCtLikes: t.smartCtLikes ?? 0,
    mintAuthorityDisabled: t.audit?.mintAuthorityDisabled ?? false,
    freezeAuthorityDisabled: t.audit?.freezeAuthorityDisabled ?? false,
    topHoldersPercentage: t.audit?.topHoldersPercentage ?? 0,
    botHoldersPercentage: t.audit?.botHoldersPercentage ?? 0,
    botHoldersCount: t.audit?.botHoldersCount ?? 0,
    devReputation: devRep,
    devWallet: t.devWallet ?? null,
    creator: primaryCreator ? {
      wallet: primaryCreator.wallet,
      username: primaryCreator.username || primaryCreator.bagsUsername || null,
      provider: primaryCreator.provider,
      pfp: primaryCreator.pfp || null,
    } : null,
    socials: {
      twitter: t.twitter ?? null,
      website: t.website ?? null,
    },
    launchpad: t.launchpad ?? "bags.fm",
    createdAt: t.createdAt ?? null,
    age: age ? formatAge(age) : null,
    ageMs: age,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug : [slug];

  try {
    // /api/tokens/feed
    if (route[0] === "feed") {
      const feed = await getTokenLaunchFeed(50);
      return res.json({ tokens: feed, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/leaderboard
    if (route[0] === "leaderboard") {
      const timeframe = req.query.timeframe || "24h";
      const sortBy = req.query.sortBy || "volume";
      const tokens = await getTopTokensByLifetimeFees(150);
      let leaderboard = tokens.map((t, i) => ({ ...mapToRow(t, i + 1), _pc: priceChange(t, timeframe) }));
      if (sortBy === "change") leaderboard.sort((a, b) => b._pc - a._pc);
      else if (sortBy === "mcap") leaderboard.sort((a, b) => b.marketCap - a.marketCap);
      else if (sortBy === "fees") leaderboard.sort((a, b) => b.lifetimeFees - a.lifetimeFees);
      else if (sortBy === "organic") leaderboard.sort((a, b) => b.organicScore - a.organicScore);
      else if (sortBy === "holders") leaderboard.sort((a, b) => b.holderCount - a.holderCount);
      else leaderboard.sort((a, b) => b.volume24h - a.volume24h);
      const ranked = leaderboard.slice(0, 50).map((t, i) => ({ ...t, rank: i + 1 }));
      return res.json({ leaderboard: ranked, timeframe, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/trending
    if (route[0] === "trending") {
      const tokens = await getTopTokensByLifetimeFees(150);
      const trending = tokens
        .filter((t) => (t.organicScore ?? 0) > 0 || vol24h(t) > 0)
        .sort((a, b) => {
          const scoreA = (a.organicScore ?? 0) * 2 + Math.log10(vol24h(a) + 1) * 10;
          const scoreB = (b.organicScore ?? 0) * 2 + Math.log10(vol24h(b) + 1) * 10;
          return scoreB - scoreA;
        })
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1) }));
      return res.json({ tokens: trending, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/fastest-growing
    if (route[0] === "fastest-growing") {
      const tf = req.query.timeframe || "24h";
      const tokens = await getTopTokensByLifetimeFees(150);
      const growing = tokens
        .filter((t) => priceChange(t, tf) > 0 && (t.mcap ?? 0) > 0)
        .sort((a, b) => priceChange(b, tf) - priceChange(a, tf))
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1) }));
      return res.json({ tokens: growing, timeframe: tf, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/new
    if (route[0] === "new") {
      const filter = req.query.filter || "all";
      const [feed, top] = await Promise.allSettled([
        getTokenLaunchFeed(100),
        getTopTokensByLifetimeFees(150),
      ]);
      const feedTokens = feed.status === "fulfilled" ? feed.value : [];
      const topTokens = top.status === "fulfilled" ? top.value : [];
      const topMap = new Map(topTokens.map((t) => [t.mint, t]));
      const seen = new Set();
      const all = feedTokens
        .filter((t) => t.mint && !seen.has(t.mint) && seen.add(t.mint))
        .map((feedToken) => {
          const rich = topMap.get(feedToken.mint);
          const merged = rich ? { ...feedToken, ...rich } : feedToken;
          const age = ageMs(merged);
          const isGrad = (merged.bondingCurve ?? 0) >= 100;
          return {
            ...mapToRow(merged, 0),
            status: feedToken.status || (isGrad ? "GRAD" : "PRE_GRAD"),
          };
        })
        .sort((a, b) => a.ageMs - b.ageMs);

      const filtered = all.filter((t) => {
        if (filter === "graduating") return (t.bondingCurve ?? 0) >= 80 && !t.isGraduated;
        if (filter === "graduated") return t.isGraduated;
        if (filter === "verified") return (t.organicScore ?? 0) >= 50 && (t.priceChange24h ?? 0) > -20;
        if (filter === "risky") return (t.sellPressure ?? 0) > 60 || (t.liquidity ?? 0) < 5000 || (t.priceChange24h ?? 0) < -30;
        return true;
      });
      return res.json({ data: filtered.slice(0, 50), updatedAt: new Date().toISOString() });
    }

    // /api/tokens/dumpers
    if (route[0] === "dumpers") {
      const tf = req.query.timeframe || "24h";
      const tokens = await getTopTokensByLifetimeFees(150);
      const dumpers = tokens
        .filter((t) => priceChange(t, tf) < -10)
        .sort((a, b) => priceChange(a, tf) - priceChange(b, tf))
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1) }));
      return res.json({ data: dumpers, timeframe: tf, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/profitable
    if (route[0] === "profitable") {
      const tf = req.query.timeframe || "24h";
      const tokens = await getTopTokensByLifetimeFees(150);
      const profitable = tokens
        .filter((t) => priceChange(t, tf) > 0 && (t.mcap ?? 0) > 0)
        .sort((a, b) => priceChange(b, tf) - priceChange(a, tf))
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1), roi: priceChange(t, tf) }));
      return res.json({ data: profitable, timeframe: tf, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/organic
    if (route[0] === "organic") {
      const tokens = await getTopTokensByLifetimeFees(150);
      const organic = tokens
        .filter((t) => vol24h(t) > 100)
        .sort((a, b) => organicBuyRatio(b) - organicBuyRatio(a))
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1) }));
      return res.json({ data: organic, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/graduating
    if (route[0] === "graduating") {
      const tokens = await getTopTokensByLifetimeFees(150);
      const graduating = tokens
        .filter((t) => t.bondingCurve != null && t.bondingCurve >= 70 && t.bondingCurve < 100)
        .sort((a, b) => (b.bondingCurve ?? 0) - (a.bondingCurve ?? 0))
        .slice(0, 30)
        .map((t, i) => ({ ...mapToRow(t, i + 1) }));
      return res.json({ data: graduating, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/search
    if (route[0] === "search") {
      const q = (req.query.q || "").toLowerCase();
      if (!q || q.length < 2) return res.json({ results: [] });
      const tokens = await getTopTokensByLifetimeFees(150);
      const results = tokens
        .filter((t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.mint.toLowerCase().includes(q)
        )
        .slice(0, 15)
        .map((t) => mapToRow(t, 0));
      return res.json({ results });
    }

    // /api/tokens/:mint/price-history
    if (route.length === 2 && route[1] === "price-history") {
      const mint = route[0];
      const window = req.query.window || "24h";
      const tokens = await getTopTokensByLifetimeFees(150);
      const token = tokens.find((t) => t.mint === mint);
      const price = token?.price ?? 0.001;
      const priceChangeVal = window === "7d"
        ? (token?.stats7d?.priceChange ?? 0)
        : window === "1h"
        ? (token?.stats1h?.priceChange ?? 0)
        : window === "4h"
        ? (token?.stats6h?.priceChange ?? 0)
        : (token?.stats24h?.priceChange ?? 0);

      const points = window === "1h" ? 12 : window === "4h" ? 24 : window === "7d" ? 168 : 24;
      const intervalMs = window === "7d" ? 3600000 : window === "24h" ? 3600000 : window === "4h" ? 600000 : 300000;
      const startPrice = price / (1 + priceChangeVal / 100);

      const data = Array.from({ length: points }, (_, i) => {
        const pct = i / points;
        const trend = pct * (priceChangeVal / 100);
        const noise = (Math.random() - 0.48) * 0.04;
        const ts = new Date(Date.now() - (points - i) * intervalMs);
        return {
          time: window === "7d"
            ? ts.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : ts.toTimeString().slice(0, 5),
          price: Math.max(0, startPrice * (1 + trend + noise)),
        };
      });
      return res.json({ data, window, currentPrice: price, change24h: priceChangeVal, updatedAt: new Date().toISOString() });
    }

    // /api/tokens/:mint — single token detail
    if (route.length === 1) {
      const mint = route[0];
      const [allTokens, creators, fees, claimStats] = await Promise.allSettled([
        getTopTokensByLifetimeFees(150),
        getTokenCreators(mint),
        getTokenLifetimeFees(mint),
        getTokenClaimStats(mint),
      ]);
      const tokens = allTokens.status === "fulfilled" ? allTokens.value : [];
      const token = tokens.find((t) => t.mint === mint);
      const creatorList = creators.status === "fulfilled" ? creators.value : [];
      const feesData = fees.status === "fulfilled" ? fees.value : { lamports: 0, sol: 0 };
      const claims = claimStats.status === "fulfilled" ? claimStats.value : [];

      if (!token) {
        return res.status(404).json({ error: "Token not found on Bags" });
      }

      const rugInfo = computeRugScore(token);
      const devRep = computeDevReputation(token);

      return res.json({
        mint,
        symbol: token.symbol,
        name: token.name,
        image: token.image,
        description: null,
        socials: { twitter: token.twitter, website: token.website },
        launchpad: token.launchpad ?? "bags.fm",
        createdAt: token.createdAt,
        price: token.price ?? 0,
        priceChange: {
          h1: token.stats1h?.priceChange ?? 0,
          h6: token.stats6h?.priceChange ?? 0,
          h24: token.stats24h?.priceChange ?? 0,
          d7: token.stats7d?.priceChange ?? 0,
          d30: token.stats30d?.priceChange ?? 0,
        },
        volume: {
          h24: (token.stats24h?.buyVolume ?? 0) + (token.stats24h?.sellVolume ?? 0),
          h6: (token.stats6h?.buyVolume ?? 0) + (token.stats6h?.sellVolume ?? 0),
        },
        liquidity: token.liquidity ?? 0,
        marketCap: token.mcap ?? token.fdv ?? 0,
        fdv: token.fdv ?? 0,
        holderCount: token.holderCount ?? 0,
        stats: {
          h1: token.stats1h,
          h6: token.stats6h,
          h24: token.stats24h,
          d7: token.stats7d,
          d30: token.stats30d,
        },
        bondingCurve: token.bondingCurve,
        isGraduated: (token.bondingCurve ?? 0) >= 100,
        organicScore: token.organicScore,
        organicScoreLabel: token.organicScoreLabel,
        ctLikes: token.ctLikes,
        smartCtLikes: token.smartCtLikes,
        lifetimeFees: { sol: feesData.sol, usd: token.feesUsd },
        audit: token.audit,
        rugAnalysis: { ...rugInfo, devReputation: devRep },
        creators: creatorList.length > 0 ? creatorList : token.creators,
        devWallet: token.devWallet,
        claimStats: claims,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(404).json({ error: "Route not found" });
  } catch (e) {
    console.error("Token API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
