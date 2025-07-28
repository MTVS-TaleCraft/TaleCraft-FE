import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/novels/:path*',
        destination: 'http://localhost:8081/api/novels/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8081/api/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
