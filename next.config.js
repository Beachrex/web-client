import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin();

// Keep in sync with PRODUCTION_HOSTS in src/lib/utils/environment.ts
const PRODUCTION_HOSTS = ["beachrex.com", "www.beachrex.com"];

/** @param {string | undefined} baseUrl */
function isProductionSite(baseUrl) {
  if (!baseUrl) return false;
  try {
    const url = new URL(/^https?:\/\//.test(baseUrl) ? baseUrl : `https://${baseUrl}`);
    return PRODUCTION_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained `.next/standalone` build for the production Docker image.
  // Required by Front/beachrex/Dockerfile.prod (VPS deployment).
  output: "standalone",

  // Transpile flowbite-react to fix module resolution issues
  transpilePackages: ["flowbite-react"],

  // Add X-Robots-Tag header to block search engines on dev/staging
  async headers() {
    const isProduction = isProductionSite(process.env.NEXT_PUBLIC_BASE_URL);

    // Only add noindex header on non-production environments
    if (!isProduction) {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-Robots-Tag',
              value: 'noindex, nofollow, noarchive, nosnippet',
            },
          ],
        },
      ];
    }

    return [];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beachrex.fra1.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.beachrex.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev-api.beachrex.com",
        pathname: "/img/**",
      },
    ],

    // Disable Vercel Image Optimization - we use Imagor for optimization
    // This prevents hitting Vercel's image optimization limits
    unoptimized: true,

    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  webpack: (config, { isServer }) => {
    // Fix for Leaflet in Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle flowbite-react module resolution
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/si/o-nas', // Slovenian slug
  //       destination: '/en/about', // Redirects to the English about page
  //       locale: false, // Ensures the locale is not added to the URL
  //     },
  //     // Add more rewrites as needed
  //   ];
  // },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
