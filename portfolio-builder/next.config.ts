import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: '**' },
      { protocol: 'http' as const, hostname: '**' },
    ],
  },
};

export default nextConfig;


