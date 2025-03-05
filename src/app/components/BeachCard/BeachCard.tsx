import React from 'react';
import { FaStar, FaHeart } from 'react-icons/fa';
import Image from 'next/image';

const BeachCard = () => {
    return (
        <div className="w-80 bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Section */}
            <div className="relative">
                <Image
                    className="w-full h-[180px] object-cover"
                    src="https://via.placeholder.com/800x600"
                    alt="Beach Image"
                    width={800}
                    height={600}
                />
                {/* Rating Section */}
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">Najbolj obiskano</div>
                    <div className="flex items-center text-white">
                        <FaStar className="text-yellow-400 w-4 h-4" />
                        <span className="ml-1 text-sm">7.2</span>
                    </div>
                </div>
                {/* Heart Icon */}
                <div className="absolute top-2 left-2">
                    <FaHeart className="text-white w-6 h-6 cursor-pointer" />
                </div>
            </div>

            {/* Beach Name and Location */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-blue-600">Plaža Ladinka</h3>
                <div className="text-sm text-gray-600 mt-2 flex items-center space-x-2">
                    <span className="text-sm font-medium">Baška</span>
                    <Image
                        src="https://via.placeholder.com/25"
                        alt="Country Flag"
                        width={42}
                        height={41}
                        className="rounded-full"
                    />
                </div>
            </div>

            {/* Price and Activity Section */}
            <div className="flex justify-between items-center bg-blue-100 p-4 rounded-b-xl">
                <div className="flex items-center space-x-2">
                    <div className="text-white bg-green-500 rounded-full px-3 py-1 text-sm">5</div>
                    <span className="text-sm text-white">od 25€</span>
                </div>
                <div className="text-xs text-white bg-orange-600 px-2 py-1 rounded-lg">Sup | Diving | Windsurfing | Coffee</div>
            </div>

            {/* Other Information */}
            <div className="p-4 text-sm text-gray-600">
                <span className="font-semibold">Crowded</span>
            </div>
        </div>
    );
};

export default BeachCard;