import { useTranslations } from 'next-intl';
import { Button } from 'flowbite-react';
import { Link } from '@/i18n/routing';

interface ContinentSectionProps {
    name: string;
    beachCount: string;
    hotelPrice: string;
    link: string;
}

const ContinentSection = ({ name, beachCount, hotelPrice, link }: ContinentSectionProps) => {
    const t = useTranslations('Common');

    return (
        <Link href={link} passHref>
            <div
                className="p-4 border border-gray-300 rounded-lg text-center bg-gray-100 flex flex-col"
            >
                <div className="h-20 bg-gray-200 mb-2" />
                <h3 className="font-bold">{name}</h3>
                <p>Prikažemo lepo plažo kontinenta, ki se pretaka v kak drugi simbol</p>
                <div className="flex-1 flex justify-center items-center space-x-4">
                    <div className="flex mt-4">
                        <Button>{t('numBeaches')}: {beachCount}</Button>
                    </div>
                    <div className="flex mt-4">
                        <Button>{t('hotelPrice')}: {hotelPrice}</Button>
                    </div>
                </div>
            </div>
        </Link>
)
    ;
};

export default ContinentSection;
