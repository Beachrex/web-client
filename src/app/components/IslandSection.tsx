import { useTranslations } from "next-intl";
import {Button} from "flowbite-react";

interface IslandSectionProps {
    islandName: string;
    beachCount: string;
    hotelPrice: string;
}

const IslandSection = ({ islandName, beachCount, hotelPrice }: IslandSectionProps) => {
    const t = useTranslations('Common');

    return (
    <div
        className="p-4 border border-gray-300 rounded-lg text-center bg-gray-100 flex flex-col"
    >
        <div className="h-20 bg-gray-200 mb-2"></div>
        <h3 className="font-bold">{islandName}</h3>
        <p>Prikažemo lepo plažo otoka, ki se pretaka v kak simbol otoka</p>
        <div className="flex-1 flex justify-center items-center space-x-4">
            <div className="flex mt-4">
                <Button>{t('numBeaches')}: {beachCount}</Button>
            </div>
            <div className="flex mt-4">
                <Button>{t('hotelPrice')}: {hotelPrice}</Button>
            </div>
        </div>
    </div>
)
    ;
};

export default IslandSection;
