import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PageProps } from '@/types';

type UserTypePageProps = PageProps<{ type: string }>;

export async function generateMetadata({ params }: UserTypePageProps) {
    const resolvedParams = await params;
    setRequestLocale(resolvedParams.locale);
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'UserTypePage' });

    // Placeholder page, hidden for launch (backend docs/features/hidden-for-launch.md): not indexed.
    return {
        robots: { index: false, follow: true },
        title: `${resolvedParams.type} - ${t('title')}`,
        description: t('description', { type: resolvedParams.type }),
    };
}

const Page = async ({ params }: UserTypePageProps) => {
    const resolvedParams = await params;
    setRequestLocale(resolvedParams.locale);
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'UserTypePage' });
    const pathname = `/user-type/${resolvedParams.type}`;

    return (
        <>
            <h1>{`${t('pageTitle')}: ${pathname}`}</h1>
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">
                    {t('userType')}: {resolvedParams.type}
                </h2>
                {/* Server-rendered content based on type */}
                <p>{t('description', { type: resolvedParams.type })}</p>
            </div>
        </>
    );
};

export default Page;

/**
 * No paths are rendered at build time (the build must not depend on the API); every page is rendered on its first
 * visit and then served from the cache (ISR, see `revalidate`). Without this, Next 14 renders every request.
 */
export function generateStaticParams() {
  return [];
}
