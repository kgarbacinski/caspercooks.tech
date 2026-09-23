/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enables standalone output for Docker deployment
  compress: true,
  poweredByHeader: false,
  devIndicators: false, // bez plakietki Next w rogu w trybie dev (zrzuty do przeglądu)
}

module.exports = nextConfig
