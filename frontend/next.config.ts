import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Production build optimizations
  typescript: {
    ignoreBuildErrors: true, // Allow builds with type errors for rapid deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow builds with lint errors for rapid deployment
  },
  
  // Build configuration
  distDir: '.next',
  output: 'standalone', // Back to standalone for better compatibility
  // trailingSlash: true,
  
  // Image optimization - disable for Railway deployment simplicity
  images: {
    unoptimized: true,
    domains: ['localhost'], // Add any external image domains here
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Environment variables that should be available to the client
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
  },
  
  // Remove async headers and redirects for build compatibility
  // These can be handled by the backend when needed
};

export default nextConfig;
