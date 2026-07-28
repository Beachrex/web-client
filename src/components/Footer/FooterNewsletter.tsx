'use client';

import { Facebook, Instagram, Youtube, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { Link } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage, StaticPageFooter } from '@/lib/api-client/types.gen';
import { subscribeToNewsletter } from '@/lib/newsletter';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function FooterNewsletter() {
  const t = useTranslations('Footer.newsletter');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  // Fetch the footer static pages so we can link the GDPR consent text to the
  // privacy policy page using its localized slug (e.g. /si/p/politika-zasebnosti,
  // /en/p/privacy-policy). Reuses the same query key as FooterInfoColumn so
  // TanStack Query deduplicates the request (single network call for both).
  const { data: footerPages } = useQuery<StaticPageFooter[]>({
    queryKey: ['static-pages', 'footer', locale],
    queryFn: async () => {
      try {
        const { data } = await getStaticPagesForFooter({
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });
        return data?.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1h — matches backend cache + ISR
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });

  // Resolve the localized privacy-policy slug. Falls back to 'privacy-policy'
  // (the EN/code slug) if the page is not in the footer list or the API fails.
  const privacyPage = footerPages?.find((p) => p.code === 'privacy-policy');
  const privacySlug = privacyPage?.slug ?? 'privacy-policy';

  // Auto-reset the form back to idle a few seconds after a success/error so
  // the user can submit another email without refreshing the page.
  useEffect(() => {
    if (status !== 'success' && status !== 'error') return;
    const delay = status === 'success' ? 5000 : 4000;
    const timer = setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, delay);
    return () => clearTimeout(timer);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    const result = await subscribeToNewsletter({
      email,
      consent,
      source: 'footer',
      locale,
    });

    if (result.success) {
      setStatus('success');
      setMessage(result.message);
      setEmail('');
      setConsent(false);
    } else {
      setStatus('error');
      // Prefer field-specific error, fall back to the generic message.
      const emailError = result.errors?.email?.[0];
      const consentError = result.errors?.consent?.[0];
      setMessage(emailError ?? consentError ?? result.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
          {t('title')}
        </h2>
        <p className="mt-2 font-figtree text-[14px] font-medium leading-none text-[#4D4D4D]">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#E7E7E7] px-[16px] py-[8px] 2xl:max-w-[720px]">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setMessage('');
              }
            }}
            placeholder={t('placeholder')}
            required
            disabled={status === 'loading' || status === 'success'}
            className="w-full flex-1 border-none bg-transparent font-figtree text-[14px] font-normal leading-[100%] text-[#4D4D4D] placeholder-[#8D8D8D] focus:outline-none focus:ring-0 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success' || !consent}
            className="flex shrink-0 items-center gap-2 rounded-[6px] bg-[#E7E7E7] px-5 py-[10px] font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] transition-colors hover:bg-[#dcdcdc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {t('button')}
          </button>
        </div>

        {/* GDPR consent checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (status !== 'idle') {
                setStatus('idle');
                setMessage('');
              }
            }}
            disabled={status === 'loading' || status === 'success'}
            className="mt-[2px] h-4 w-4 shrink-0 cursor-pointer rounded border-[#8D8D8D] text-[#1A3C68] focus:ring-[#1A3C68] disabled:opacity-50"
          />
          <span className="font-figtree text-[12px] font-normal leading-[140%] text-[#8D8D8D]">
            {t.rich('gdprConsent', {
              privacy: (chunks) => (
                <Link
                  href={`/p/${privacySlug}`}
                  className="font-medium text-[#1A3C68] underline underline-offset-2 hover:text-[#2a4c78]"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        {/* Success / error message */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-[6px] px-3 py-2 ${
              'font-figtree text-[12px] font-medium leading-[140%] '
            }${
              status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
      </form>

      <div className="flex items-center gap-3 pt-1">
        <NextLink
          href="https://www.facebook.com/beachrexproject/"
          aria-label="Facebook"
          target="_blank"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Facebook className="h-4 w-4" />
        </NextLink>
        <NextLink
          href="https://www.instagram.com/beachrex_project/"
          aria-label="Instagram"
          target="_blank"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Instagram className="h-4 w-4" />
        </NextLink>
        <NextLink
          href="https://www.youtube.com/@BeachRex"
          aria-label="YouTube"
          target="_blank"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8D8D8D] text-white"
        >
          <Youtube className="h-4 w-4" />
        </NextLink>
      </div>
    </div>
  );
}
