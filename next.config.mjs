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
  webpack: (config, { isServer }) => {
    // Fix @ledgerhq ESM import resolution issue
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
  // Pages router — no App Router
  experimental: {},
};

export default nextConfig;
