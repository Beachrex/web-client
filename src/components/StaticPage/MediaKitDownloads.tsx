'use client';

/**
 * Media kit downloads under the CMS page `media-kit` (owner, 2026-10-08):
 * the full brand package, the guidelines and every logo version, colour and format.
 */

import { useTranslations } from 'next-intl';
import {
  BRAND_COLORS,
  LOGO_COLORS,
  LOGO_PREVIEW_BACKGROUND,
  LOGO_VERSIONS,
  MEDIA_KIT_GUIDELINES,
  MEDIA_KIT_PACKAGE,
  PALETTE_FILES,
  SOCIAL_FILES,
  logoFiles,
} from '@/config/mediaKit';

const sectionTitle = 'text-2xl font-bold text-[#1A3C68] mt-12 mb-4';
const linkClass = 'text-[#1A3C68] font-medium underline underline-offset-2 hover:text-[#2a4c78]';
const buttonClass = [
  'inline-flex items-center rounded-lg bg-[#1A3C68] px-5 py-3 text-[15px] font-semibold text-white',
  'transition hover:bg-[#2a4c78]',
].join(' ');

export default function MediaKitDownloads() {
  const t = useTranslations('MediaKit');

  return (
    <section aria-labelledby="media-kit-downloads" className="mt-12 border-t border-[#E7E7E7] pt-4">
      <h2 id="media-kit-downloads" className={sectionTitle}>{t('downloadsTitle')}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E7E7E7] p-5">
          <h3 className="text-lg font-semibold text-[#1A3C68]">{t('packageTitle')}</h3>
          <p className="mt-2 mb-4 text-[15px]">{t('packageDescription')}</p>
          <a href={MEDIA_KIT_PACKAGE} download className={buttonClass}>{t('packageButton')}</a>
        </div>
        <div className="rounded-xl border border-[#E7E7E7] p-5">
          <h3 className="text-lg font-semibold text-[#1A3C68]">{t('guidelinesTitle')}</h3>
          <ul className="mt-3 space-y-2">
            {MEDIA_KIT_GUIDELINES.map((g) => (
              <li key={g.href}>
                <a href={g.href} download className={linkClass}>{g.language} (PDF)</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className={sectionTitle}>{t('logosTitle')}</h2>
      {LOGO_VERSIONS.map((version) => (
        <div key={version} className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-[#1A3C68]">{t(`versions.${version}`)}</h3>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOGO_COLORS.map((color) => {
              const { preview, files } = logoFiles(version, color);
              return (
                <li key={color} className="overflow-hidden rounded-xl border border-[#E7E7E7]">
                  <div
                    className="flex h-28 items-center justify-center p-4"
                    style={{ backgroundColor: LOGO_PREVIEW_BACKGROUND[color] }}
                  >
                    {/* SVG from public/: next/image adds nothing for vector files */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={t('logoAlt', { version: t(`versions.${version}`), color: t(`colors.${color}`) })}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#222]">{t(`colors.${color}`)}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {files.map((f) => (
                        <a
key={f.href} href={f.href} download
className={linkClass}
                        >{f.format}</a>
                      ))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <h2 className={sectionTitle}>{t('colorsTitle')}</h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {BRAND_COLORS.map((c) => (
          <li key={c.key} className="overflow-hidden rounded-xl border border-[#E7E7E7]">
            <div className="h-16" style={{ backgroundColor: c.hex }} />
            <div className="p-3 text-xs leading-5">
              <p className="text-sm font-semibold text-[#222]">{c.name}</p>
              <p>HEX {c.hex}</p>
              <p>RGB {c.rgb}</p>
              <p>CMYK {c.cmyk}</p>
              {c.pantone && <p>PANTONE {c.pantone}</p>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
        <span>{t('paletteDownload')}:</span>
        {PALETTE_FILES.map((f) => (
          <a
key={f.href} href={f.href} download
className={linkClass}
          >{f.format}</a>
        ))}
      </p>

      <h2 className={sectionTitle}>{t('socialTitle')}</h2>
      <ul className="space-y-2">
        {SOCIAL_FILES.map((f) => (
          <li key={f.href}>
            <a href={f.href} download className={linkClass}>{t(`social.${f.key}`)}</a>
            <span className="ml-2 text-sm text-[#8D8D8D]">PNG, {f.size} px</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
