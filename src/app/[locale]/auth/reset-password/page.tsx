import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/Auth/ResetPasswordForm';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Auth' });
  return { title: t('resetTitle') };
}

/** Target of the reset e-mail link: `?token=…&email=…` (backend `POST /reset-password`). */
export default async function ResetPasswordPage({ params }: PageProps) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Auth' });

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="mb-6 font-figtree text-[28px] font-bold text-[#222222]">{t('resetTitle')}</h1>
      {/* Reads `?token=…&email=…` in the browser: the page itself is static (ISR) and never holds a token. */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
