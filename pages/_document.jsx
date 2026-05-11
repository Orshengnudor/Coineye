import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Real-time Solana token analytics: leaderboard, new launches, whale watch, rug radar, social buzz, and portfolio tracking powered by Bags.fm." />
        <meta name="theme-color" content="#080808" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CoinEye — Solana Token Intelligence" />
        <meta property="og:description" content="Real-time Solana token analytics: leaderboard, new launches, whale watch, rug radar, social buzz, and portfolio tracking." />
        <meta property="og:site_name" content="CoinEye" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
