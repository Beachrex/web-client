import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/env';
import PreviewAccessForm from '@/components/PreviewAccess/PreviewAccessForm';
import PreviewShell from '@/components/PreviewAccess/PreviewShell';
import { previewTranslator } from '@/lib/preview-gate/messages';
import {
  isPreviewGateActive,
  previewPageLocale,
  readPreviewGateConfig,
  sanitizeReturnPath,
} from '@/lib/preview-gate/preview-gate';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { return?: string; error?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = previewPageLocale(sanitizeReturnPath(searchParams.return), headers().get('accept-language'));
  const t = await previewTranslator(locale);
  return { title: t('metaTitle'), robots: { index: false, follow: false, nocache: true } };
}

/** E-mail form of the closed dev/uat website. */
export default async function PreviewAccessPage({ searchParams }: Props) {
  if (!isPreviewGateActive(readPreviewGateConfig())) redirect('/');

  const returnPath = sanitizeReturnPath(searchParams.return);
  const locale = previewPageLocale(returnPath, headers().get('accept-language'));
  const t = await previewTranslator(locale);

  return (
    <PreviewShell title={t('title')}>
      {searchParams.error === 'link' && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {t('linkInvalid')}
        </p>
      )}
      <p className="mb-6 text-base leading-6">{t('intro')}</p>
      <PreviewAccessForm
        apiEndpoint={env.NEXT_PUBLIC_API_ENDPOINT}
        locale={locale}
        returnPath={returnPath}
        texts={{
          emailLabel: t('emailLabel'),
          submit: t('submit'),
          sending: t('sending'),
          sent: t('sent'),
          failed: t('failed'),
        }}
      />
    </PreviewShell>
  );
}
