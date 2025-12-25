/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [],
  },
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/NextStep',
  // Note: API routes in pages/api/ will be ignored during static export
  // They won't work on GitHub Pages (static hosting only)
}

module.exports = nextConfig


