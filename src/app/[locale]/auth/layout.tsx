import type { Metadata } from 'next';

/** Sign-in pages (Google callback, forgot / reset password) are never indexed and never leak their URL. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
