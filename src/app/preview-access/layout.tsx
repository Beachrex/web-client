import '@/styles/globals.css';
import { headers } from 'next/headers';
import { toHtmlLang } from '@/app/config/locales';
import { previewPageLocale } from '@/lib/preview-gate/preview-gate';

/**
 * Own root layout for the closed-website pages (backend ADR "Closed dev/uat websites behind an e-mail magic link"):
 * no header, footer, chat or analytics, and nothing that calls the API.
 */
export default function PreviewAccessLayout({ children }: { children: React.ReactNode }) {
  const locale = previewPageLocale(null, headers().get('accept-language'));
  return (
    <html lang={toHtmlLang(locale)}>
      <body style={{ margin: 0, background: '#F5F5F5', fontFamily: 'Figtree, Arial, Helvetica, sans-serif', color: '#222222' }}>
        {children}
      </body>
    </html>
  );
}
