import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PreviewShell from '@/components/PreviewAccess/PreviewShell';
import { previewTranslator } from '@/lib/preview-gate/messages';
import { isPreviewGateActive, previewPageLocale, readPreviewGateConfig } from '@/lib/preview-gate/preview-gate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

/**
 * Target of the e-mail link. The token is used up only by the button (POST), never by opening the link, so mail
 * link scanners that fetch every URL cannot spend it.
 */
export default async function PreviewAccessCallbackPage({ searchParams }: { searchParams: { token?: string } }) {
  if (!isPreviewGateActive(readPreviewGateConfig())) redirect('/');
  const token = typeof searchParams.token === 'string' ? searchParams.token.slice(0, 128) : '';
  if (!token) redirect('/preview-access');

  const t = await previewTranslator(previewPageLocale(null, headers().get('accept-language')));

  return (
    <PreviewShell title={t('callbackTitle')}>
      <p className="mb-6 text-base leading-6">{t('callbackIntro')}</p>
      <form method="post" action="/preview-access/verify">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="min-h-[44px] w-full rounded-lg px-4 py-2 font-bold text-white"
          style={{ background: '#1A3C68' }}
        >
          {t('callbackButton')}
        </button>
      </form>
    </PreviewShell>
  );
}
