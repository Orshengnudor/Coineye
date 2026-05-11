# Migration Complete ✓

## Status: DONE — build passes, dev server confirmed working (GET / 200)

## What was built
- Full Next.js 16 + Pages Router + plain JS migration of coineye (Bun/Vite/Hono → Next.js/npm)
- 24 pages, 4 API routes, 7 components, 5 service files
- Build: `npm run build` passes clean (only a Privy `@farcaster/mini-app-solana` warning — safe to ignore)

## Remaining tasks for user
1. Add API keys to `.env.local`:
   - `BAGS_API_KEY` — get from bags.fm dashboard
   - `HELIUS_API_KEY` — free at helius.dev
   - `DATABASE_AUTH_TOKEN` — Turso dashboard

2. Push to GitHub:
   ```
   cd ~/coineye-next
   git init && git add . && git commit -m "Initial Next.js migration"
   gh repo create coineye-next --private --source=. --push
   ```

3. Deploy to Vercel:
   ```
   npx vercel --yes
   ```
   Then add env vars in Vercel dashboard Settings → Environment Variables

4. (Optional) Rename: `mv ~/coineye ~/coineye-old && mv ~/coineye-next ~/coineye`

## Known issues (non-blocking)
- `@farcaster/mini-app-solana` warning from Privy — harmless, missing optional dep
- No `@solana/wallet-adapter-wallets` (caused Ledger ESM crash) — replaced with phantom + solflare individual packages
- `whales.jsx` fetches `/api/analytics/whales` which falls back to bags_organic source when no HELIUS_API_KEY
