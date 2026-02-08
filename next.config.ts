import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable in dev to avoid MathJax "contains" null error (Strict Mode double-mount leaves stale refs)
  reactStrictMode: process.env.NODE_ENV !== 'development',
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];
    const base = apiUrl.replace(/\/$/, '');
    return [{ source: '/api/auth/forgot-password', destination: `${base}/api/auth/forgot-password` }, { source: '/api/auth/reset-password', destination: `${base}/api/auth/reset-password` }];
  },
};

export default nextConfig;
