import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Electron desktop app packaging
  output: 'standalone',

  // Allow external images for video thumbnails
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Server-side packages that should not be bundled for the client
  serverExternalPackages: ['better-sqlite3'],

  // Enable turbopack (default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
