/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enables standalone output for Docker deployment
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
