import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 blocks local IP/localhost optimization by default.
    // Required for local API-hosted product images (dev/private network only).
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_IMAGE_ALLOW_LOCAL_IP === 'true',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
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
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
