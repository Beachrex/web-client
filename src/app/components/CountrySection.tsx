import { useTranslations } from "next-intl";
import {Button} from "flowbite-react";

interface CountrySectionProps {
    countryName: string;
    beachCount: string;
    hotelPrice: string;
}

const CountrySection = ({ countryName, beachCount, hotelPrice }: CountrySectionProps) => {
    const t = useTranslations('Common');

    return (
        <div
            className="p-4 border border-gray-300 rounded-lg text-center bg-gray-100 flex flex-col"
        >
            <div className="h-20 bg-gray-200 mb-2"></div>
            <h3 className="font-bold">{countryName}</h3>
            <p>Prikažemo lepo plažo države, ki se pretaka kak drugi simbol</p>
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

export default CountrySection;
