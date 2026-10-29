'use client';

import React from 'react';

import { SITE_SETTINGS_FALLBACK, type SiteSettings } from '@/lib/site-settings';

const SiteSettingsContext = React.createContext<SiteSettings>(SITE_SETTINGS_FALLBACK);

/** TASK-009: admin switches, read once per page on the server (`[locale]/layout.tsx`). */
export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return React.useContext(SiteSettingsContext);
}
