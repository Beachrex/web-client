import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/Auth/ForgotPasswordForm';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Auth' });
  return { title: t('forgotTitle') };
}

/** "Forgot password": sends the reset e-mail (backend `POST /forgot-password`). */
export default async function ForgotPasswordPage({ params }: PageProps) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Auth' });

  return (
    <section className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="font-figtree text-[28px] font-bold text-[#222222]">{t('forgotTitle')}</h1>
      <p className="mb-6 mt-3 font-figtree text-[16px] text-[#4D4D4D]">{t('forgotDescription')}</p>
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </section>
  );
}
