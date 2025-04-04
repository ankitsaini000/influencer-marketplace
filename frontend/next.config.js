/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  // Add configuration to ignore Grammarly attributes
  compiler: {
    styledComponents: true,
    // Ignore Grammarly browser extension attributes that cause warnings
    ignoreDuringBuilds: true,
  },
  // Configure which HTML attributes to accept
  experimental: {
    // This will ignore data-* attributes from causing warnings
    largePageDataBytes: 128 * 1000, // default is 128KB
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
};

module.exports = nextConfig;
