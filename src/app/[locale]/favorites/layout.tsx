import type { Metadata } from 'next';

/** A personal list: never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
