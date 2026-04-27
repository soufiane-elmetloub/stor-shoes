import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "https://api-production-ba03.up.railway.app/api",
  },
  images: {
    // Next 16 blocks local IP/localhost optimization by default.
    // Required for local API-hosted product images (dev/private network only).
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_IMAGE_ALLOW_LOCAL_IP === 'true',
    domains: ['api-production-ba03.up.railway.app', 'storshoes-api.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-production-ba03.up.railway.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storshoes-api.up.railway.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://api-production-ba03.up.railway.app/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
