// Bags.fm — Direct HTTP integration
const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";
const LAMPORTS_PER_SOL = 1_000_000_000;

function getKey() {
  return process.env.BAGS_API_KEY || "";
}

function hasKey() {
  return !!getKey();
}

async function bagsGet(path, params) {
  const key = getKey();
  if (!key) throw new Error("No BAGS_API_KEY");

  const url = new URL(`${BAGS_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": key },
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(json?.response || json?.error || `Bags API error ${res.status}`);
  }
  return json?.response ?? json;
}

// ── Feed (newest launches) ───────────────────────────────────────────────────

export async function getTokenLaunchFeed(limit = 50) {
  try {
    if (!hasKey()) return getMockBagsTokens();
    const data = await bagsGet("/token-launch/feed");
    const items = Array.isArray(data) ? data : [];
    return items.slice(0, limit).map((t) => ({
      mint: t.tokenMint || t.mint || "",
      symbol: t.symbol || "",
      name: t.name || "",
      image: t.image || t.imageUrl,
      description: t.description,
      twitter: t.twitter || null,
      website: t.website || null,
      status: t.status || "PRE_GRAD",
      accountKeys: t.accountKeys,
      dbcPoolKey: t.dbcPoolKey,
      createdAt: t.createdAt || null,
    }));
  } catch (e) {
    console.error("Bags feed error:", e);
    return getMockBagsTokens();
  }
}

// ── Top Tokens (rich data) ───────────────────────────────────────────────────

export async function getTopTokensByLifetimeFees(limit = 100) {
  try {
    if (!hasKey()) return [];
    const data = await bagsGet("/token-launch/top-tokens/lifetime-fees");
    const items = Array.isArray(data) ? data : [];
    return items.slice(0, limit).map(mapTopToken);
  } catch (e) {
    console.error("Bags top fees error:", e);
    return [];
  }
}

function mapTopToken(t) {
  const ti = t.tokenInfo || {};
  const feesLamports = parseFloat(t.lifetimeFees || "0");
  const audit = ti.audit || {};

  const mapStats = (s) => {
    if (!s) return undefined;
    return {
      priceChange: s.priceChange ?? 0,
      holderChange: s.holderChange ?? 0,
      liquidityChange: s.liquidityChange ?? 0,
      volumeChange: s.volumeChange ?? 0,
      buyVolume: s.buyVolume ?? 0,
      sellVolume: s.sellVolume ?? 0,
      buyOrganicVolume: s.buyOrganicVolume ?? 0,
      sellOrganicVolume: s.sellOrganicVolume ?? 0,
      numBuys: s.numBuys ?? 0,
      numSells: s.numSells ?? 0,
      numTraders: s.numTraders ?? 0,
      numNetBuyers: s.numNetBuyers ?? 0,
    };
  };

  const creators = Array.isArray(t.creators) ? t.creators.map((c) => ({
    wallet: c.wallet || "",
    username: c.username || c.bagsUsername || "",
    bagsUsername: c.bagsUsername,
    provider: c.provider || "unknown",
    providerUsername: c.providerUsername,
    pfp: c.pfp,
    isCreator: c.isCreator ?? false,
    isAdmin: c.isAdmin ?? false,
    royaltyBps: c.royaltyBps ?? 0,
    totalClaimed: c.totalClaimed,
  })) : [];

  return {
    mint: t.token || "",
    symbol: ti.symbol || "",
    name: ti.name || ti.symbol || "",
    image: ti.icon || ti.image,
    twitter: ti.twitter || null,
    website: ti.website || null,
    createdAt: ti.createdAt || ti.firstPool?.createdAt,
    launchpad: ti.launchpad,
    metaLaunchpad: ti.metaLaunchpad,

    price: ti.usdPrice,
    fdv: ti.fdv,
    mcap: ti.mcap,
    liquidity: ti.liquidity,
    holderCount: ti.holderCount,

    stats1h: mapStats(ti.stats1h),
    stats6h: mapStats(ti.stats6h),
    stats24h: mapStats(ti.stats24h),
    stats7d: mapStats(ti.stats7d),
    stats30d: mapStats(ti.stats30d),

    lifetimeFeesLamports: feesLamports,
    lifetimeFees: feesLamports / LAMPORTS_PER_SOL,
    feesUsd: ti.fees,

    organicScore: ti.organicScore,
    organicScoreLabel: ti.organicScoreLabel,
    ctLikes: ti.ctLikes,
    smartCtLikes: ti.smartCtLikes,

    bondingCurve: typeof ti.bondingCurve === "number" ? ti.bondingCurve : null,

    audit: audit ? {
      mintAuthorityDisabled: audit.mintAuthorityDisabled ?? false,
      freezeAuthorityDisabled: audit.freezeAuthorityDisabled ?? false,
      topHoldersPercentage: audit.topHoldersPercentage ?? 0,
      devMigrations: audit.devMigrations ?? 0,
      devMints: audit.devMints ?? 0,
      botHoldersCount: audit.botHoldersCount ?? 0,
      botHoldersPercentage: audit.botHoldersPercentage ?? 0,
      devFundedAt: audit.devFundedAt,
    } : undefined,

    creators,
    devWallet: ti.dev,
  };
}

// ── Single token endpoints ───────────────────────────────────────────────────

export async function getTokenLifetimeFees(mint) {
  try {
    if (!hasKey()) return { lamports: 0, sol: 0 };
    const data = await bagsGet("/token-launch/lifetime-fees", { tokenMint: mint });
    const lamports = parseFloat(data?.lifetimeFees || data?.totalFees || "0");
    return { lamports, sol: lamports / LAMPORTS_PER_SOL };
  } catch {
    return { lamports: 0, sol: 0 };
  }
}

export async function getTokenCreators(mint) {
  try {
    if (!hasKey()) return [];
    const data = await bagsGet("/token-launch/creator/v3", { tokenMint: mint });
    const items = Array.isArray(data) ? data : [];
    return items.map((c) => ({
      wallet: c.wallet || "",
      username: c.username || c.bagsUsername || "",
      bagsUsername: c.bagsUsername,
      provider: c.provider || "unknown",
      providerUsername: c.providerUsername,
      pfp: c.pfp,
      isCreator: c.isCreator ?? false,
      isAdmin: c.isAdmin ?? false,
      royaltyBps: c.royaltyBps ?? 0,
      totalClaimed: c.totalClaimed,
    }));
  } catch {
    return [];
  }
}

export async function getTokenClaimStats(mint) {
  try {
    if (!hasKey()) return [];
    const data = await bagsGet("/token-launch/claim-stats", { tokenMint: mint });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ── Derived helpers ──────────────────────────────────────────────────────────

export function computeRugScore(t) {
  let score = 0;
  const flags = [];

  const pc24 = t.stats24h?.priceChange ?? 0;
  if (pc24 < -80) { score += 35; flags.push("PRICE_CRASH"); }
  else if (pc24 < -50) { score += 20; flags.push("HEAVY_DROP"); }
  else if (pc24 < -30) { score += 10; flags.push("NOTABLE_DROP"); }

  const liq = t.liquidity ?? 0;
  const mc = t.mcap || t.fdv || 1;
  const liqRatio = liq / mc;
  if (liqRatio < 0.03 || liq < 500) { score += 30; flags.push("MICRO_LIQ"); }
  else if (liqRatio < 0.07 || liq < 2000) { score += 15; flags.push("LOW_LIQ"); }

  const buys = t.stats24h?.numBuys ?? 0;
  const sells = t.stats24h?.numSells ?? 0;
  const sellRatio = sells / (buys + sells + 1);
  if (sellRatio > 0.75) { score += 25; flags.push("SELL_PRESSURE"); }
  else if (sellRatio > 0.6) { score += 12; flags.push("ELEVATED_SELLS"); }

  const botPct = t.audit?.botHoldersPercentage ?? 0;
  if (botPct > 50) { score += 20; flags.push("BOT_DOMINATED"); }
  else if (botPct > 25) { score += 10; flags.push("HIGH_BOTS"); }

  const devMints = t.audit?.devMints ?? 0;
  if (devMints > 10000) { score += 30; flags.push("SERIAL_RUGGER"); }
  else if (devMints > 1000) { score += 15; flags.push("REPEAT_MINTER"); }
  else if (devMints > 100) { score += 8; flags.push("MULTI_MINT"); }

  const devMig = t.audit?.devMigrations ?? 0;
  if (devMig > 100) { score += 15; flags.push("DEV_MIGRATED"); }

  const organic = t.organicScore ?? 50;
  if (organic < 20) { score += 20; flags.push("INORGANIC"); }
  else if (organic < 40) { score += 10; flags.push("LOW_ORGANIC"); }

  const topHoldersPct = t.audit?.topHoldersPercentage ?? 0;
  if (topHoldersPct > 60) { score += 15; flags.push("HIGH_CONCENTRATION"); }

  if (t.createdAt) {
    const ageH = (Date.now() - new Date(t.createdAt).getTime()) / 3600000;
    if (ageH < 6) { score += 10; flags.push("NEW_TOKEN"); }
  }

  return { score: Math.min(100, score), flags };
}

export function computeDevReputation(t) {
  const devMints = t.audit?.devMints ?? 0;
  const devMig = t.audit?.devMigrations ?? 0;

  if (devMints > 10000 || devMig > 200) {
    return { label: "Serial Rugger", level: "danger", devMints, devMigrations: devMig };
  }
  if (devMints > 1000 || devMig > 50) {
    return { label: "Repeat Minter", level: "warning", devMints, devMigrations: devMig };
  }
  if (devMints > 100 || devMig > 10) {
    return { label: "Suspicious", level: "suspicious", devMints, devMigrations: devMig };
  }
  return { label: "Clean", level: "clean", devMints, devMigrations: devMig };
}

function getMockBagsTokens() {
  const mocks = [
    { symbol: "DOGE2", name: "Doge 2.0" },
    { symbol: "PEPE3", name: "PepeCoin 3" },
    { symbol: "MOON", name: "MoonShot" },
    { symbol: "CHAD", name: "ChadToken" },
    { symbol: "BASED", name: "Based Coin" },
  ];
  return mocks.map((m, i) => ({
    mint: `${m.symbol}111111111111111111111111111${i}`.slice(0, 44),
    symbol: m.symbol,
    name: m.name,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    status: "PRE_GRAD",
  }));
}
