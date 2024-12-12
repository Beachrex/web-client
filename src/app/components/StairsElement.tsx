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
            bgColor: '#0069ab',
            link: '/beach/haludovo',
        },
        {
            title: 'Pine Beach',
            subtitle: 'Plaža Zlatni Rat',
            statTitle: 'Št. nastanitev:',
            statValue: '45',
            activityTitle: 'Št. aktivnosti:',
            activityValue: '8',
            bgColor: '#fca311',
            link: '/beach/zlatni-rat',
        },
        {
            title: 'Sunset Beach',
            subtitle: 'Plaža Laganini',
            statTitle: 'Št. nastanitev:',
            statValue: '22',
            activityTitle: 'Št. aktivnosti:',
            activityValue: '5',
            bgColor: '#ff4b5c',
            link: '/beach/laganini',
        },
    ];

    return (
        <div className="relative m-4">
            {elements.map((element, index) => (
                <Link href={element.link} key={index}>
                    <div
                        className={`absolute left-[${index * 20}px] top-[${index * 60}px] w-[760px] h-[54px] bg-[${element.bgColor}] rounded-[10px] shadow flex items-center justify-between px-4
                        transition-all duration-500 ease-in-out transform ${index !== elements.length - 1 ? 'hover:scale-105 hover:h-[220px] hover:opacity-100' : ''}`}
                        style={{ backgroundColor: element.bgColor }} // Set background dynamically
                    >
                        {/* Left Section: Title and Subtitle (Non-hoverable) */}
                        <div className="flex items-center gap-4">
                            <div className="px-2.5 py-1 bg-white rounded-2xl flex items-center gap-1.5">
                                <div
                                    className="text-xl font-bold"
                                    style={{ color: element.bgColor }} // Set text color dynamically
                                >
                                    {element.title}
                                </div>
                            </div>
                            <div className="text-center text-white text-3xl font-bold">{element.subtitle}</div>
                        </div>

                        {/* Right Section: Stats (Hoverable) */}
                        <div className="flex items-center gap-4">
                            {/* Number of Accommodations */}
                            <div className="shadow px-2.5 py-[11px] bg-white rounded-md flex items-center gap-2">
                                <FaBed className="text-[#0069ab] w-5 h-5" /> {/* Accommodation Icon */}
                                <div className="text-center text-[#222222] text-sm font-medium">{element.statTitle}</div>
                                <div className="text-center text-[#0069ab] text-sm font-bold">{element.statValue}</div>
                            </div>

                            {/* Number of Activities */}
                            <div className="shadow px-2.5 py-[11px] bg-white rounded-md flex items-center gap-2">
                                <FaTasks className="text-[#0069ab] w-5 h-5" /> {/* Activity Icon */}
                                <div className="text-center text-[#222222] text-sm font-medium">{element.activityTitle}</div>
                                <div className="text-center text-[#0069ab] text-sm font-bold">{element.activityValue}</div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default StairsElement;