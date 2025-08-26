
/** @type {import('next').NextConfig} */
const nextConfig = {
  // پیکربندی برای GitHub Pages
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // تنظیمات مسیر برای GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/mojtaba-tahrir' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/mojtaba-tahrir/' : '',
  
  // بهینه‌سازی تصاویر
  images: {
    unoptimized: true, // برای GitHub Pages
    domains: [
      'localhost',
      'supabase.co',
      'github.com',
      'raw.githubusercontent.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // تنظیمات TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // تنظیمات ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // فشرده‌سازی
  compress: true,

  // تنظیمات امنیتی
  poweredByHeader: false,

  // تنظیمات React
  reactStrictMode: true,
  swcMinify: true,

  // تنظیمات تجربی
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Headers امنیتی
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites برای API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // تنظیمات Webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // بهینه‌سازی bundle
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };

    // پشتیبانی از فایل‌های SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // بهینه‌سازی برای production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      };
    }

    return config;
  },

  // متغیرهای محیطی عمومی
  env: {
    CUSTOM_KEY: 'mojtaba-tahrir',
    SITE_NAME: 'مجتبی تحریر',
    SITE_DESCRIPTION: 'فروشگاه آنلاین لوازم التحریر و نوشت افزار',
  },

  // تنظیمات i18n (چندزبانه)
  i18n: {
    locales: ['fa', 'en'],
    defaultLocale: 'fa',
    localeDetection: false,
  },

  // تنظیمات PWA (اختیاری)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

// Bundle Analyzer (فقط در صورت نیاز)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
