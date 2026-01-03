/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();

const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
}

module.exports = withNextIntl(nextConfig);
