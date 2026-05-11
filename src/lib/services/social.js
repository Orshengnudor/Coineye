// Social data — sourced from Bags.fm token feed
import { getTopTokensByLifetimeFees } from "./bags.js";

export async function getMergedSocialBuzz() {
  try {
    const tokens = await getTopTokensByLifetimeFees(50);

    return tokens
      .map((t) => {
        const holders = t.holderCount ?? 0;
        const priceChange = t.stats24h?.priceChange ?? 0;
        const sentiment = Math.max(0, Math.min(100, 50 + priceChange * 0.8));
        const trending = priceChange > 20 && holders > 100;
        const mentions = holders;
        const dir = priceChange >= 0 ? 1 : -1;
        const mentionHistory = Array.from({ length: 7 }, (_, i) => {
          const curve = i <= 3 ? i / 3 : (7 - i) / 3;
          return Math.max(0, Math.floor(mentions * (0.4 + curve * 0.6 + dir * 0.05 * Math.random())));
        });

        return {
          symbol: t.symbol,
          name: t.name,
          mint: t.mint,
          mentions,
          mentionChange: parseFloat(priceChange.toFixed(1)),
          sentiment: Math.round(sentiment),
          tweetCount: Math.floor(mentions * 0.3),
          trending,
          mentionHistory,
          topTweet: t.name ? `${t.name} ($${t.symbol}) — ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(1)}% 24h | ${holders} holders` : undefined,
          twitterUrl: t.twitter,
          websiteUrl: t.website,
        };
      })
      .sort((a, b) => b.mentions - a.mentions);
  } catch (e) {
    console.error("Social fetch error:", e);
    return [];
  }
}

export async function getMentionTimeSeries(_symbol) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      mentions: Math.floor(Math.random() * 800 + 100),
      sentiment: parseFloat((Math.random() * 1.4 - 0.4).toFixed(2)),
    };
  });
}
