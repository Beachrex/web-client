/**
 * Media kit downloads (owner, 2026-10-08): the brand package (CGP v1.0) lives in
 * `public/brand/BeachRex_CGP/` and is shown under the CMS page with code `media-kit`.
 * The page text (how to use the logo) is CMS content; this file lists the files.
 */

export const MEDIA_KIT_PAGE_CODE = 'media-kit';

const BASE = '/brand/BeachRex_CGP';

export const MEDIA_KIT_PACKAGE = '/brand/BeachRex_CGP.zip';

export const MEDIA_KIT_GUIDELINES = [
  { language: 'Slovenščina', href: `${BASE}/BeachRex_CGP_smernice.pdf` },
  { language: 'English', href: `${BASE}/BeachRex_Brand_Guidelines_EN.pdf` },
] as const;

export const LOGO_VERSIONS = ['horizontal', 'stacked', 'symbol', 'wordmark'] as const;
export const LOGO_COLORS = ['color', 'black', 'white', 'teal', 'orange'] as const;

export type LogoVersion = (typeof LOGO_VERSIONS)[number];
export type LogoColor = (typeof LOGO_COLORS)[number];

const FOLDER: Record<LogoVersion, string> = {
  horizontal: 'Horizontal',
  stacked: 'Stacked',
  symbol: 'Symbol',
  wordmark: 'Wordmark',
};

/** Preview background per colour: the guidelines put the white logo on teal, the rest on white. */
export const LOGO_PREVIEW_BACKGROUND: Record<LogoColor, string> = {
  color: '#FFFFFF',
  black: '#FFFFFF',
  white: '#00B2C9',
  teal: '#FFFFFF',
  orange: '#FFFFFF',
};

export interface LogoFile {
  format: string;
  href: string;
}

export function logoFiles(version: LogoVersion, color: LogoColor): { preview: string; files: LogoFile[] } {
  const dir = `${BASE}/01_Logo/${FOLDER[version]}`;
  const name = `beachrex_${version}_${color}`;
  return {
    preview: `${dir}/SVG/${name}.svg`,
    files: [
      { format: 'SVG', href: `${dir}/SVG/${name}.svg` },
      { format: 'PNG 1000 px', href: `${dir}/PNG/${name}_1000px.png` },
      { format: 'PNG 3000 px', href: `${dir}/PNG/${name}_3000px.png` },
      { format: 'PDF', href: `${dir}/PDF/${name}.pdf` },
      { format: 'EPS', href: `${dir}/EPS/${name}.eps` },
    ],
  };
}

export const BRAND_COLORS = [
  { key: 'teal', name: 'BeachRex Teal', hex: '#00B2C9', rgb: '0 178 201', cmyk: 'C80 M0 Y20 K0', pantone: '3125 C' },
  { key: 'orange', name: 'BeachRex Orange', hex: '#EB8751', rgb: '235 135 81', cmyk: 'C0 M56 Y70 K0', pantone: '7577 C' },
  { key: 'sea', name: 'Deep Sea', hex: '#0F3B45', rgb: '15 59 69', cmyk: 'C90 M50 Y45 K45', pantone: null },
  { key: 'sand', name: 'Sand', hex: '#FFF4E8', rgb: '255 244 232', cmyk: 'C0 M4 Y9 K0', pantone: null },
  { key: 'white', name: 'White', hex: '#FFFFFF', rgb: '255 255 255', cmyk: 'C0 M0 Y0 K0', pantone: null },
] as const;

export const PALETTE_FILES = [
  { format: 'Adobe (.ase)', href: `${BASE}/04_Barve/BeachRex_palette.ase` },
  { format: 'CSS', href: `${BASE}/04_Barve/colors.css` },
  { format: 'JSON', href: `${BASE}/04_Barve/colors.json` },
] as const;

export const SOCIAL_FILES = [
  { key: 'profile', href: `${BASE}/03_Social/profile_teal_1080.png`, size: '1080 × 1080' },
  { key: 'og', href: `${BASE}/03_Social/og-image_1200x630.png`, size: '1200 × 630' },
  { key: 'facebook', href: `${BASE}/03_Social/facebook-cover_1640x624.png`, size: '1640 × 624' },
  { key: 'linkedin', href: `${BASE}/03_Social/linkedin-cover_1584x396.png`, size: '1584 × 396' },
  { key: 'x', href: `${BASE}/03_Social/x-header_1500x500.png`, size: '1500 × 500' },
] as const;
