import Layout from '@/app/components/Layout';
import {useTranslations} from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('AboutPage'); // For translations, if needed

    return (
        <>
            <div className="container mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold">{t('aboutUs')}</h1>
                <p className="mt-4">{t('description')}</p>
            </div>
        </>
    );
}
