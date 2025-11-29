import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile flowbite-react to fix module resolution issues
  transpilePackages: ["flowbite-react"],

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

    // Add image optimization settings to handle small images
    minimumCacheTTL: 60,
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Disable optimization for development to avoid issues with small images
    unoptimized: process.env.NODE_ENV === "development",

    // Add device sizes for better optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

export default withNextIntl(nextConfig);
