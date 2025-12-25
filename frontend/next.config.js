/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [],
  },
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Skip API routes during static export (they won't work on GitHub Pages anyway)
  exportPathMap: async function (defaultPathMap) {
    // Filter out API routes
    const paths = { ...defaultPathMap }
    Object.keys(paths).forEach((path) => {
      if (path.startsWith('/api/')) {
        delete paths[path]
      }
    })
    return paths
  },
}

module.exports = nextConfig


