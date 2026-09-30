import type {NextConfig} from 'next';

// Set when building for GitHub Pages (see .github/workflows/deploy-pages.yml).
// GitHub Pages serves project sites under /<repo-name>/, so assets/routes
// need that prefix baked in at build time.
const GH_PAGES_BASE_PATH = process.env.GITHUB_PAGES_BASE_PATH || '';
const isStaticExport = process.env.BUILD_TARGET === 'github-pages';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    // next/image's optimization API needs a server, which GitHub Pages
    // (static hosting only) doesn't have.
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  ...(isStaticExport
    ? {
        output: 'export',
        basePath: GH_PAGES_BASE_PATH,
        assetPrefix: GH_PAGES_BASE_PATH,
        trailingSlash: true,
      }
    : {output: 'standalone'}),
  transpilePackages: ['motion'],
  // Django backend endpoints require a trailing slash (APPEND_SLASH). Next.js
  // normally 308-redirects "/api/x/" -> "/api/x" before app/api/[...path]/route.ts
  // ever runs, which then bounces straight back off Django's APPEND_SLASH -
  // an infinite redirect loop the browser reports as "Failed to fetch".
  skipTrailingSlashRedirect: true,
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
