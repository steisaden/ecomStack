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
  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    if (process.env.NODE_ENV === 'production') {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' });
      headers.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "img-src 'self' https: data:",
          "media-src 'self' https:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "style-src 'self' 'unsafe-inline' https:",
          "connect-src 'self' https:",
          "font-src 'self' https: data:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self' https:",
          "upgrade-insecure-requests"
        ].join('; ')
      });
    }

    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },
  // Do not expose server secrets to the client bundle via next.config env.
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
