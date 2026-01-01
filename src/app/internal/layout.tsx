import '@/styles/globals.css';
import { ApiClientProvider } from '@/components/ApiClientProvider';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Internal Routes Layout
 *
 * Minimal layout for internal/dev-only pages.
 * No header, footer, or i18n - just API client provider.
 */
export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.className}>
      <body>
        <ApiClientProvider locale="en">
          {children}
        </ApiClientProvider>
      </body>
    </html>
  );
}

