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
  productionBrowserSourceMaps: false,
  // Allow access to remote image placeholder.
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
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
    : {}),
  transpilePackages: ['motion'],
  skipTrailingSlashRedirect: true,
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
