import { useTranslations } from "next-intl";
import {Button} from "flowbite-react";

interface CitySectionProps {
    cityName: string;
    beachCount: string;
    hotelPrice: string;
}

const CitySection = ({ cityName, beachCount, hotelPrice }: CitySectionProps) => {
    const t = useTranslations('Common');

    return (
        <div
            className="p-4 border border-gray-300 rounded-lg text-center bg-gray-100 flex flex-col"
        >
            <div className="h-20 bg-gray-200 mb-2"></div>
            <h3 className="font-bold">{cityName}</h3>
            <p>Prikažemo lepo plažo mesta, ki se pretaka v grb mesta</p>
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

export default CitySection;
