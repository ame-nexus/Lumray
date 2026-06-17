import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pin the workspace root — the monorepo has a root lockfile (for `concurrently`)
  // plus this project's own, which otherwise makes Turbopack guess the wrong root.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: '*.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    minimumCacheTTL: 86400,
    formats: ['image/webp'],
  },
  experimental: {
    proxyTimeout: 30000,
  },
}

export default nextConfig
