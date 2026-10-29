'use client';

import { useEffect, useState } from 'react';
import { locales } from '@/app/config/locales';

interface ErrorTexts { title: string; subtitle: string; description: string; retry: string; goHome: string }

/**
 * Last-resort error screen for a crash in the locale layout itself. It replaces the whole
 * document, so there is no next-intl provider and no global CSS: the locale comes from the URL
 * and only that locale's messages are loaded (English until they arrive).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState('en');
  const [texts, setTexts] = useState<ErrorTexts | null>(null);

  useEffect(() => {
    console.error(error);
    const first = window.location.pathname.split('/')[1] ?? '';
    const current = (locales as readonly string[]).includes(first) ? first : 'en';
    setLocale(current);
    import(`../../messages/${current}.json`)
      .then((module: { default: { ErrorPage: ErrorTexts } }) => setTexts(module.default.ErrorPage))
      .catch(() => import('../../messages/en.json').then((module) => setTexts(module.default.ErrorPage)));
  }, [error]);

  const font = 'Figtree, Arial, sans-serif';

  return (
    <html lang={locale}>
      <body style={{ margin: 0, fontFamily: font, background: '#FFFFFF' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 16px',
            textAlign: 'center',
          }}
        >
          {texts && (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0069AB', margin: 0 }}>
                {texts.subtitle}
              </p>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: '#222222', margin: '12px 0 0' }}>{texts.title}</h1>
              <p style={{ fontSize: 16, color: '#4D4D4D', maxWidth: 576, margin: '16px 0 0' }}>{texts.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                <button
                  type="button"
                  onClick={() => reset()}
                  style={{
                    border: 0,
                    borderRadius: 6,
                    background: '#1A3C68',
                    color: '#FFFFFF',
                    padding: '12px 20px',
                    fontFamily: font,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {texts.retry}
                </button>
                <a
                  href={`/${locale}`}
                  style={{
                    borderRadius: 6,
                    background: '#F5F5F5',
                    color: '#4D4D4D',
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {texts.goHome}
                </a>
              </div>
            </>
          )}
        </main>
      </body>
    </html>
  );
}
