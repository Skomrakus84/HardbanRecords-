/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeFonts: true,
    optimizeImages: true,
  },
  images: {
    domains: [
      'localhost',
      'fannbqzvjwyazeosectm.supabase.co'
    ]
  }
}

module.exports = nextConfig