'use client';

import { useTranslations } from 'next-intl';
import { FEATURES } from '@/lib/constants/features';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constants/mobile-apps';

const BADGE = [
  'inline-flex h-11 items-center gap-2 rounded-lg bg-black px-3 text-white',
  'transition-opacity hover:opacity-85',
].join(' ');

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path fill="#34A853" d="M3.6 1.8 13.4 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Z" />
      <path fill="#FBBC04" d="m16.8 8.6-3.4 3.4 3.4 3.4 3.9-2.2c.8-.5.8-1.7 0-2.2l-3.9-2.4Z" />
      <path fill="#4285F4" d="M3.6 22.2 13.4 12l3.4 3.4-11.5 6.6c-.6.4-1.2.4-1.7.2Z" />
      <path fill="#EA4335" d="M3.6 1.8c.5-.2 1.1-.2 1.7.2l11.5 6.6-3.4 3.4L3.6 1.8Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"
aria-hidden="true"
    >
      <path
d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7
        0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0
        2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.4-4.1ZM14 5.2c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1
        2.9 1.1.1 2.1-.6 2.8-1.4Z"
      />
    </svg>
  );
}

/** Store badges in the footer brand column. Only Google Play for now; the App Store badge is hidden. */
export default function FooterAppBadges() {
  const t = useTranslations('Footer.app');
  const showAppStore = FEATURES.iosAppBadge && APP_STORE_URL !== '';

  return (
    <div className="flex flex-col gap-2">
      <p className="font-figtree text-[14px] font-semibold text-[#1A3C68]">{t('title')}</p>
      <div className="flex flex-wrap gap-2">
        <a
href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer"
className={BADGE}
        >
          <GooglePlayIcon />
          <span className="flex flex-col leading-none">
            <span className="text-[9px] tracking-wide">{t('googlePlayTop')}</span>
            <span className="text-[16px] font-semibold">Google Play</span>
          </span>
        </a>
        {showAppStore && (
          <a
href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
className={BADGE}
          >
            <AppleIcon />
            <span className="flex flex-col leading-none">
              <span className="text-[9px]">{t('appStoreTop')}</span>
              <span className="text-[16px] font-semibold">App Store</span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
