import { getTranslations } from 'next-intl/server';

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'UserTypePage' });

    return {
        title: t('title'),
        description: t('description'),
    };
}

const Page = async ({ params }: PageProps) => {
    const resolvedParams = await params;
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