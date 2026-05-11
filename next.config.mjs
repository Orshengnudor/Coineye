/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "cdn.bags.fm" },
      { protocol: "https", hostname: "arweave.net" },
    ],
    unoptimized: true,
  },

  webpack: (config) => {
    // Fix Privy Farcaster error
    config.externals = [
      ...(config.externals || []),
      '@farcaster/mini-app-solana'
    ];

    // Common Solana fixes
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },

  // Fix for lockfile warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;