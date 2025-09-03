import React from 'react';
import Link from 'next/link'; // Import Link from Next.js
import { FaBed, FaTasks } from 'react-icons/fa'; // Importing the icons

const StairsElement = () => {
    const elements = [
        {
            title: 'Morska plaža',
            subtitle: 'Plaža Haludovo',
            statTitle: 'Št. nastanitev:',
            statValue: '56',
            activityTitle: 'Št. aktivnosti:',
            activityValue: '12',
            bgColor: 'bg-[#0069ab]',
            textColor: 'text-[#0069ab]',
            link: '/beach/haludovo',
            left: '0',  // Adjusted for static position classes
        },
        {
            title: 'Pine Beach',
            subtitle: 'Plaža Zlatni Rat',
            statTitle: 'Št. nastanitev:',
            statValue: '45',
            activityTitle: 'Št. aktivnosti:',
            activityValue: '8',
            bgColor: 'bg-[#fca311]',
            textColor: 'text-[#fca311]',
            link: '/beach/zlatni-rat',
            left: '40',
        },
        {
            title: 'Sunset Beach',
            subtitle: 'Plaža Laganini',
            statTitle: 'Št. nastanitev:',
            statValue: '66',
            activityTitle: 'Št. aktivnosti:',
            activityValue: '5',
            bgColor: 'bg-[#ff4b5c]',
            textColor: 'text-[#ff4b5c]',
            link: '/beach/laganini',
            left: '80',
        },
    ];

    const leftVariants = [
        "left-0 sm:left-0",
        "left-2 sm:left-20",
        "left-4 sm:left-60",
    ];

    return (
        <div className="relative m-2 sm:m-4">
            {elements.map((element, index) => (
                <Link href={element.link} key={index}>
                    <div
                        className={`absolute ${leftVariants[index]} top-[${index * 45}px] sm:top-[${index * 60}px]
                        w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[760px]
                        h-[40px] sm:h-[54px] ${element.bgColor} rounded-[10px] shadow
                        flex items-center justify-between px-2 sm:px-4
                        transition-all duration-200 ease-in-out transform
                        ${index !== elements.length - 1 ? 'hover:scale-105 hover:z-10 hover:opacity-100' : ''}`}
                    >
                        {/* Left Section: Title and Subtitle (Non-hoverable) */}
                        <div className="flex items-center gap-1 sm:gap-4">
                            <div className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-2xl flex items-center gap-1 sm:gap-1.5">
                                <div
                                    className={`text-sm sm:text-xl font-bold ${element.textColor}`}
                                >
                                    {element.title}
                                </div>
                            </div>
                            <div className="text-center text-white text-lg sm:text-3xl font-bold hidden sm:block">{element.subtitle}</div>
                            <div className="text-center text-white text-sm font-bold sm:hidden">{element.subtitle}</div>
                        </div>

                        {/* Right Section: Stats */}
                        <div className="flex items-center gap-1 sm:gap-4">
                            {/* Number of Accommodations */}
                            <div className="shadow px-1 sm:px-2.5 py-1 sm:py-[11px] bg-white rounded-md flex items-center gap-1 sm:gap-2">
                                <FaBed className="text-[#0069ab] w-3 h-3 sm:w-5 sm:h-5" /> {/* Accommodation Icon */}
                                <div className="text-center text-[#222222] text-xs sm:text-sm font-medium hidden sm:block">{element.statTitle}</div>
                                <div className="text-center text-[#0069ab] text-xs sm:text-sm font-bold">{element.statValue}</div>
                            </div>

                            {/* Number of Activities */}
                            <div className="shadow px-1 sm:px-2.5 py-1 sm:py-[11px] bg-white rounded-md flex items-center gap-1 sm:gap-2">
                                <FaTasks className="text-[#0069ab] w-3 h-3 sm:w-5 sm:h-5" /> {/* Activity Icon */}
                                <div className="text-center text-[#222222] text-xs sm:text-sm font-medium hidden sm:block">{element.activityTitle}</div>
                                <div className="text-center text-[#0069ab] text-xs sm:text-sm font-bold">{element.activityValue}</div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default StairsElement;