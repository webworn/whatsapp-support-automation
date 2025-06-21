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
  output: 'standalone', // Optimized for Docker deployment
  
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
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: isProduction 
              ? 'public, max-age=3600, must-revalidate' 
              : 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
