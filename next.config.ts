import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@ericblade/quagga2', 'ndarray-pixels', 'sharp'],
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@auth0\/nextjs-auth0/ },
    ];

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'ndarray-pixels$': 'ndarray-pixels/dist/ndarray-pixels-browser.js',
        sharp$: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
