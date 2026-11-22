import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https' as const, hostname: '**' },
      { protocol: 'http' as const, hostname: '**' },
    ],
  },
  // F14: baseline security headers. A full Content-Security-Policy (script/style
  // sources) needs its own pass because reCAPTCHA, GA4 and the preview iframes load
  // external content; frame-ancestors and object-src are the safe subset for now.
  async headers() {
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
    ];
    const hsts = process.env.NODE_ENV === 'production'
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
      : [];
    return [{ source: '/:path*', headers: [...common, ...hsts] }];
  },
};

export default nextConfig;


