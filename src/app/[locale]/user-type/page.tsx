import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PageProps } from '@/types';

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    setRequestLocale(resolvedParams.locale);
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'UserTypePage' });

    // Placeholder page, hidden for launch (backend docs/features/hidden-for-launch.md): not indexed.
    return {
        robots: { index: false, follow: true },
        title: t('title'),
        description: t('description'),
    };
}

const Page = async ({ params }: PageProps) => {
    const resolvedParams = await params;
    setRequestLocale(resolvedParams.locale);
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'UserTypePage' });
    const pathname = '/user-type';

    return (
        <>
            <h1>{`${t('pageTitle')}: ${pathname}`}</h1>
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">{t('allUserTypes')}</h2>
                {/* Server-rendered content */}
                <p>{t('description')}</p>
            </div>
        </>
    );
};

export default Page;
