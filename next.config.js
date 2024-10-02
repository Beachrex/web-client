import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'beachrex.fra1.digitaloceanspaces.com',
                pathname: '/**', // You can specify a specific path if needed
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/si/o-nas', // Slovenian slug
                destination: '/en/about', // Redirects to the English about page
                locale: false, // Ensures the locale is not added to the URL
            },
            // Add more rewrites as needed
        ];
    },
};

export default withNextIntl(nextConfig);