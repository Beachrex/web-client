import { getTranslations } from 'next-intl/server';
import type { PageProps } from '@/types';

type BeachTypePageProps = PageProps<{ type: string }>;

export async function generateMetadata({ params }: BeachTypePageProps) {
    const resolvedParams = await params;
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'BeachTypePage' });

    // Placeholder page, hidden for launch (backend docs/features/hidden-for-launch.md): not indexed.
    return {
        robots: { index: false, follow: true },
        title: `${resolvedParams.type} - ${t('title')}`,
        description: t('description', { type: resolvedParams.type }),
    };
}

const Page = async ({ params }: BeachTypePageProps) => {
    const resolvedParams = await params;
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'BeachTypePage' });
    const pathname = `/beach-type/${resolvedParams.type}`;

    return (
        <>
            <h1>{`${t('pageTitle')}: ${pathname}`}</h1>
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">
                    {t('beachType')}: {resolvedParams.type}
                </h2>
                {/* Server-rendered content based on type */}
                <p>{t('description', { type: resolvedParams.type })}</p>
            </div>
        </>
    );
};

export default Page;
