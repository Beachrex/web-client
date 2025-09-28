import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beachrex.fra1.digitaloceanspaces.com",
        pathname: "/**", // You can specify a specific path if needed
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
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
    return config;
  },
  // async rewrites() {
  //     return [
  //         {
  //             source: '/si/o-nas', // Slovenian slug
  //             destination: '/en/about', // Redirects to the English about page
  //             locale: false, // Ensures the locale is not added to the URL
  //         },
  //         // Add more rewrites as needed
  //     ];
  // },
};

export default withNextIntl(nextConfig);
