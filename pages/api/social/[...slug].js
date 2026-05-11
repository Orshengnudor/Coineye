import { getMergedSocialBuzz, getMentionTimeSeries } from "../../../src/lib/services/social.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug : [slug];

  try {
    // /api/social/buzz
    if (route[0] === "buzz") {
      const sortBy = req.query.sortBy || "mentions";
      let data = await getMergedSocialBuzz();
      if (sortBy === "sentiment") data.sort((a, b) => b.sentiment - a.sentiment);
      else if (sortBy === "velocity") data.sort((a, b) => b.mentionChange - a.mentionChange);
      else if (sortBy === "trending") data.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
      else data.sort((a, b) => b.mentions - a.mentions);
      return res.json({ data, updatedAt: new Date().toISOString() });
    }

    // /api/social/timeseries/:symbol
    if (route[0] === "timeseries" && route[1]) {
      const symbol = route[1];
      const series = await getMentionTimeSeries(symbol);
      return res.json({ symbol, series });
    }

    // /api/social/community
    if (route[0] === "community") {
      const tokens = [
        { symbol: "BONK", name: "Bonk", twitterFollowers: 450000, discordMembers: 120000, communityScore: 92, growthRate: 12.4, twitterUrl: "https://x.com/bonk_inu" },
        { symbol: "WIF", name: "dogwifhat", twitterFollowers: 280000, discordMembers: 85000, communityScore: 87, growthRate: 8.1, twitterUrl: "https://x.com/dogwifcoin" },
        { symbol: "JUP", name: "Jupiter", twitterFollowers: 520000, discordMembers: 230000, communityScore: 95, growthRate: 5.2, twitterUrl: "https://x.com/JupiterExchange" },
        { symbol: "RAY", name: "Raydium", twitterFollowers: 210000, discordMembers: 89000, communityScore: 81, growthRate: 6.8, twitterUrl: "https://x.com/RaydiumProtocol" },
      ];
      return res.json({ data: tokens, updatedAt: new Date().toISOString() });
    }

    // /api/social/token/:mint
    if (route[0] === "token" && route[1]) {
      const mint = route[1];
      return res.json({
        mint,
        mentions24h: Math.floor(Math.random() * 500),
        sentiment: Math.floor(Math.random() * 40 + 40),
        twitterFollowers: Math.floor(Math.random() * 100000),
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(404).json({ error: "Route not found" });
  } catch (e) {
    console.error("Social API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
