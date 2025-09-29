import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-100 py-8">
            <div className="container mx-auto flex justify-between px-4">
                {/* First Column - Logo */}
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold">
                        <Image
width="200" height="100" alt="Beachrex Logo"
src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/js/assets/img/logo_dark.png`} className="mainLogo mr-3 h-6 sm:h-9"
                        />
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">Your tagline or description here.</p>
                </div>

                {/* Second Column - Links */}
                <div className="flex flex-col">
                    <h2 className="font-semibold">Links</h2>
                    <ul className="mt-2 space-y-1">
                        <li><a href="#" className="text-gray-700 hover:underline">Link 1</a></li>
                        <li><a href="#" className="text-gray-700 hover:underline">Link 2</a></li>
                        <li><a href="#" className="text-gray-700 hover:underline">Link 3</a></li>
                    </ul>
                </div>

                {/* Third Column - More Links */}
                <div className="flex flex-col">
                    <h2 className="font-semibold">More Links</h2>
                    <ul className="mt-2 space-y-1">
                        <li><a href="#" className="text-gray-700 hover:underline">Link A</a></li>
                        <li><a href="#" className="text-gray-700 hover:underline">Link B</a></li>
                        <li><a href="#" className="text-gray-700 hover:underline">Link C</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
