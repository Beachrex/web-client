import { getTranslations } from 'next-intl/server';

interface PageProps {
    params: {
        locale: string;
        type: string;
    };
}

export async function generateMetadata({ params }: PageProps) {
    const t = await getTranslations({ locale: params.locale, namespace: 'UserTypePage' });

    return {
        title: `${params.type} - ${t('title')}`,
        description: t('description', { type: params.type }),
    };
}

const Page = async ({ params }: PageProps) => {
    const t = await getTranslations({ locale: params.locale, namespace: 'UserTypePage' });
    const pathname = `/user-type/${params.type}`;

    return (
        <>
            <h1>{`${t('pageTitle')}: ${pathname}`}</h1>
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">
                    {t('userType')}: {params.type}
                </h2>
                {/* Server-rendered content based on type */}
                <p>{t('description', { type: params.type })}</p>
            </div>
        </>
    );
};

export default Page;