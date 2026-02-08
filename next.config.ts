import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable in dev to avoid MathJax "contains" null error (Strict Mode double-mount leaves stale refs)
  reactStrictMode: process.env.NODE_ENV !== 'development',
};

export default nextConfig;
