import { useTranslations } from 'next-intl';
import { Button } from 'flowbite-react';

interface RegionSectionProps {
    regionName: string;
    beachCount: string;
}

const RegionSection = ({ regionName, beachCount }: RegionSectionProps) => {
    const t = useTranslations('Common');

    return (
        <div
            className="p-4 border border-gray-300 rounded-lg text-center bg-gray-100 flex flex-col"
        >
            <div className="h-20 bg-gray-200 mb-2" />
            <h3 className="font-bold">{regionName}</h3>
            <p>Prikažemo lepo plažo regije, ki se pretaka v grb regije</p>
            <div className="flex justify-end mt-4">
                <Button>{t('numBeaches')}: {beachCount}</Button>
            </div>
        </div>
    );
};

export default RegionSection;
