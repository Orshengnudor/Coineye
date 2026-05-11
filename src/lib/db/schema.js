import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Cached token data from external APIs
export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mint: text("mint").notNull().unique(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  logoUri: text("logo_uri"),
  source: text("source").notNull().default("bags"), // bags | pumpfun | raydium | jupiter | orca | moonshot
  price: real("price"),
  priceChange24h: real("price_change_24h"),
  priceChange7d: real("price_change_7d"),
  priceChange30d: real("price_change_30d"),
  marketCap: real("market_cap"),
  volume24h: real("volume_24h"),
  volume7d: real("volume_7d"),
  liquidity: real("liquidity"),
  holderCount: integer("holder_count"),
  holderGrowth24h: real("holder_growth_24h"),
  launchTime: integer("launch_time", { mode: "timestamp" }),
  devWallet: text("dev_wallet"),
  isRugged: integer("is_rugged", { mode: "boolean" }).default(false),
  rugScore: real("rug_score").default(0), // 0-100
  socialScore: real("social_score").default(0),
  twitterMentions24h: integer("twitter_mentions_24h").default(0),
  twitterMentions7d: integer("twitter_mentions_7d").default(0),
  pairAddress: text("pair_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Whale wallets
export const whales = sqliteTable("whales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wallet: text("wallet").notNull(),
  tokenMint: text("token_mint").notNull(),
  balance: real("balance").notNull(),
  balanceUsd: real("balance_usd"),
  percentOwned: real("percent_owned"),
  label: text("label"), // "Dev", "VC", "Whale", "Dumper"
  lastActivity: integer("last_activity", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Social mentions time series
export const socialMentions = sqliteTable("social_mentions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenMint: text("token_mint").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  platform: text("platform").notNull().default("twitter"), // twitter | telegram | discord
  mentionCount: integer("mention_count").notNull().default(0),
  sentimentScore: real("sentiment_score").default(0), // -1 to 1
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// User watchlist (when wallet connected)
export const watchlist = sqliteTable("watchlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wallet: text("wallet").notNull(),
  tokenMint: text("token_mint").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Rug alerts
export const rugAlerts = sqliteTable("rug_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenMint: text("token_mint").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  alertType: text("alert_type").notNull(), // liquidity_removed | dev_dump | whale_exit | honeypot
  severity: text("severity").notNull().default("medium"), // low | medium | high | critical
  description: text("description").notNull(),
  txSignature: text("tx_signature"),
  detectedAt: integer("detected_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Price snapshots for charts
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenMint: text("token_mint").notNull(),
  price: real("price").notNull(),
  volume: real("volume").default(0),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});
