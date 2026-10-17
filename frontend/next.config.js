/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  // Dev only: proxy /api to the local Express app so an ngrok front-end (HTTPS)
  // can call the API on the same origin without mixed-content errors.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  devIndicators: false,
}

module.exports = nextConfig
