import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict type checking and ESLint errors for production build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Build optimizations
  distDir: '.next',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
