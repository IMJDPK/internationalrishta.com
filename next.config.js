/** @type {import('next').NextConfig} */
const withNextIntl = require("next-intl/plugin")();

const supabaseRemotePatterns = [];
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    supabaseRemotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Invalid URL — skip; local static assets still work
  }
}

const nextConfig = {
  images: {
    remotePatterns: supabaseRemotePatterns,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

module.exports = withNextIntl(nextConfig);
