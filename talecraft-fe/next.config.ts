import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://52.78.166.172:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
