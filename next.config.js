/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic configuration: avoid static export in dev because Middleware and API routes require Node runtime
  // Use standalone for Docker production builds; optionally allow explicit static export via NEXT_OUTPUT
  output: process.env.NEXT_OUTPUT
    ? process.env.NEXT_OUTPUT
    : (process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined),
  trailingSlash: true,
  images: {
    // Enable image optimization
    unoptimized: false,
    // Add domains for image optimization - DEPRECATED, handled by remotePatterns
    // domains: ['images.ctfassets.net', 'localhost', 'images.unsplash.com', 'cdn.contentful.com', 'm.media-amazon.com', 'images-na.ssl-images-amazon.com', 'images-eu.ssl-images-amazon.com', 'images-fe.ssl-images-amazon.com', 'via.placeholder.com', 'placehold.co'],
    // Set responsive image sizes - optimized for faster loading
    deviceSizes: [320, 420, 640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128],
    // Configure formats
    formats: ['image/webp', 'image/avif'],
    // Add quality settings for better performance
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    // Add remote patterns for better security
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.contentful.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images-eu.ssl-images-amazon.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images-fe.ssl-images-amazon.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
    ],
  },
  experimental: {
    // Enable React Compiler for performance improvements
    reactCompiler: true,
  },
  async redirects() {
    return [
      { source: '/yoga', destination: '/yoga-booking', permanent: false },
      { source: '/yoga/', destination: '/yoga-booking', permanent: false },
    ]
  },
  env: {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_WEBHOOK_SECRET: process.env.CONTENTFUL_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    CONTENTFUL_MANAGEMENT_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  },
  // Optimize webpack configuration for smaller bundles
  webpack: (config, { isServer }) => {
    // Enable compression for smaller bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // Add compression plugin for better minification
    config.optimization = config.optimization || {}
    config.optimization.minimize = true

    // Handle CommonJS modules for Amazon SDK compatibility
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Configure externals for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'paapi5-nodejs-sdk': 'commonjs paapi5-nodejs-sdk',
        'aws4': 'commonjs aws4'
      });
    }

    return config
  },
}

module.exports = nextConfig
