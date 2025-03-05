import React from "react";
import StairsElement from "@/app/components/StairsElement";
import Image from 'next/image';

// The main component for the page layout
const BeachPage = () => {
    return (
        <>
            <div
                className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-cover bg-center rounded-xl overflow-hidden"
                style={{backgroundImage: "url('https://via.placeholder.com/1888x745')"}}>
                <StairsElement/>


            </div>


            <div className="w-[1920px] h-[4663px] relative bg-white">

                <Image
                    className="w-[1888px] h-[745px] left-[16px] top-[229px] absolute rounded-[10px]"
                     src="https://via.placeholder.com/1888x745"
                    alt="todo alt name"
                    width={1888}
                    height={745}
                />
                <div className="left-[1560px] top-[194px] absolute justify-end items-center gap-[60px] inline-flex">
                    <div className="justify-start items-center gap-2 flex">
                        <div className="w-3 h-3 relative origin-top-left -rotate-180"/>
                        <div className="text-[#0069ab] text-sm font-bold font-['Figtree'] underline">Ena plaža</div>
                    </div>
                    <div className="justify-start items-center gap-2 flex">
                        <div className="text-[#0069ab] text-sm font-bold font-['Figtree'] underline">Enadruga plaža
                        </div>
                        <div className="w-3 h-3 relative"/>
                    </div>
                </div>
                <div
                    className="left-0 top-[636px] absolute opacity-30 text-white text-[200px] font-bold font-['Figtree']">plaža
                </div>
                <div
                    className="w-[138px] h-[54px] px-3 py-[9px] left-[30px] top-[247px] absolute bg-[#57aba1] rounded-[10px] flex-col justify-start items-start gap-4 inline-flex">
                    <div className="justify-start items-center gap-4 inline-flex">
                        <div className="w-[35px] h-[35px] relative rounded-tl-[10px] rounded-bl-[10px]"/>
                        <div className="text-white text-xl font-bold font-['Figtree']">Evropa</div>
                    </div>
                </div>
                <div
                    className="left-[100px] top-[781px] absolute text-white text-[100px] font-bold font-['Figtree']">Plaža
                    Haludovo
                </div>
                <div
                    className="px-3 py-3.5 left-[87px] top-[247px] absolute bg-[#8fd2d1] rounded-[10px] shadow flex-col justify-center items-center gap-2.5 inline-flex">
                    <div className="justify-start items-center gap-4 inline-flex">
                        <div className="text-white text-xl font-bold font-['Figtree']">Hrvaška</div>
                    </div>
                </div>
                <div
                    className="h-[54px] px-3 py-[15px] left-[143px] top-[247px] absolute bg-[#edd520] rounded-[10px] shadow justify-center items-center gap-2.5 inline-flex">
                    <div className="text-white text-xl font-bold font-['Figtree']">Kvarner</div>
                </div>
                <div
                    className="px-4 py-1.5 left-[199px] top-[247px] absolute bg-[#ff9b0f] rounded-[10px] shadow flex-col justify-center items-start gap-2.5 inline-flex">
                    <div className="text-center text-white text-xl font-bold font-['Figtree']">Krk</div>
                </div>
                <div
                    className="h-[54px] px-3 py-[11px] left-[255px] top-[247px] absolute bg-[#ff6239] rounded-[10px] shadow justify-center items-center gap-2.5 inline-flex">
                    <div className="text-white text-xl font-bold font-['Figtree']">Malinska</div>
                </div>
                <div
                    className="px-4 py-1.5 left-[311px] top-[247px] absolute bg-[#0069ab] rounded-[10px] shadow flex-col justify-start items-start gap-2.5 inline-flex">
                    <div className="justify-start items-center gap-10 inline-flex">
                        <div className="justify-start items-center gap-4 flex">
                            <div
                                className="px-2.5 py-[3px] bg-white rounded-2xl justify-start items-center gap-1.5 flex">
                                <div className="text-[#0069ab] text-xl font-bold font-['Figtree']">Morska plaža</div>
                            </div>
                            <div className="text-center text-white text-3xl font-bold font-['Figtree']">Plaža Haludovo
                            </div>
                        </div>
                        <div className="justify-start items-center gap-2 flex">
                            <div className="shadow justify-start items-center gap-2 flex">
                                <div
                                    className="px-2.5 py-[11px] bg-white rounded-md justify-center items-center gap-2 flex">
                                    <div className="w-5 h-5 relative"/>
                                    <div className="justify-start items-center gap-1 flex">
                                        <div
                                            className="text-center text-[#222222] text-sm font-medium font-['Figtree']">Št.
                                            nastanitev:
                                        </div>
                                        <div
                                            className="text-center text-[#0069ab] text-sm font-bold font-['Figtree']">56
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="shadow justify-start items-center gap-2 flex">
                                <div
                                    className="px-2.5 py-[11px] bg-white rounded-md justify-center items-center gap-2 flex">
                                    <div className="w-5 h-5 relative"/>
                                    <div className="justify-start items-center gap-1 flex">
                                        <div
                                            className="text-center text-[#222222] text-sm font-medium font-['Figtree']">Št.
                                            aktivnosti:
                                        </div>
                                        <div
                                            className="text-center text-[#0069ab] text-sm font-bold font-['Figtree']">12
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="h-[35.80px] px-3 py-[3px] left-[1553px] top-[256px] absolute bg-neutral-100 rounded-[30px] justify-start items-center gap-2 inline-flex">
                    <div className="justify-start items-center gap-2 flex">
                        <div className="text-center text-[#4c4c4c] text-xs font-semibold font-['Figtree']">Google
                            review
                        </div>
                    </div>
                    <div
                        className="w-[23px] h-[23px] px-[1.28px] pt-[1.78px] pb-[1.75px] justify-center items-center flex"/>
                    <div className="justify-start items-center gap-2 flex">
                        <div className="text-center text-[#4c4c4c] text-base font-bold font-['Figtree']">7.2</div>
                    </div>
                </div>
                <div
                    className="h-[35.80px] px-3 py-[3px] left-[1733.50px] top-[256px] absolute bg-white rounded-[30px] justify-start items-center gap-2 inline-flex">
                    <div className="justify-start items-center gap-2 flex">
                        <div className="text-center text-[#4c4c4c] text-xs font-semibold font-['Figtree']">Shrani</div>
                    </div>
                    <div className="w-5 h-5 relative">
                        <div className="w-5 h-5 left-0 top-0 absolute"/>
                        <div className="w-5 h-5 left-0 top-0 absolute"/>
                    </div>
                </div>
                <div className="left-[100px] top-[925px] absolute justify-start items-center gap-3 inline-flex">
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-16 flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Kamnita
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative">
                                <div className="w-[28.73px] h-9 left-[4.15px] top-0 absolute">
                                </div>
                            </div>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Primerna
                                za družine
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Parkirišče
                                na voljo
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Preprost
                                dostop
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-16 flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Windsurfing
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Parkirišče
                                na voljo
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-16 flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative"/>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Windsurfing
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative">
                                <div className="w-[28.73px] h-9 left-[4.15px] top-0 absolute">
                                </div>
                            </div>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">Primerna
                                za družine
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-[101px] h-[95px] px-2.5 py-2 bg-[#e7f6ff] rounded-[10px] flex-col justify-start items-center gap-2.5 inline-flex">
                        <div className="h-[81px] flex-col justify-center items-center gap-[11px] flex">
                            <div className="w-9 h-9 relative">
                                <div className="w-[28.73px] h-9 left-[4.15px] top-0 absolute">
                                </div>
                            </div>
                            <div
                                className="self-stretch text-center text-[#0069ab] text-sm font-bold font-['Figtree']">MAX
                                9 poudarkov
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="w-[703px] h-[95px] px-5 py-[13px] left-[1118px] top-[925px] absolute bg-neutral-100 rounded-[10px] flex-col justify-center items-center gap-2.5 inline-flex">
                    <div className="self-stretch h-[63.21px] flex-col justify-start items-start gap-1 flex">
                        <div
                            className="self-stretch text-[#4c4c4c] text-xs font-normal font-['Figtree'] leading-none">Lorem
                            Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
                            the standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen
                        </div>
                        <div className="w-[82.60px] h-[27.21px] justify-start items-center gap-1 inline-flex">
                            <div className="text-[#8d8d8d] text-[10px] font-medium font-['Figtree'] underline">Preberi
                                več
                            </div>
                            <div className="w-3 h-3 relative"/>
                        </div>
                    </div>
                </div>
                <div className="w-36 h-36 left-[1353px] top-[757px] absolute">
                    <Image className="w-36 h-36 left-0 top-0 absolute rounded-[10px] shadow" alt="todo alt name"
                         src="https://via.placeholder.com/144x144"
                           width={144}
                           height={144}
                    />
                    <div
                        className="w-36 h-36 left-[144px] top-[144px] absolute origin-top-left -rotate-180 opacity-70 bg-gradient-to-t from-[#e6e6e6] via-[#acacac] to-[#4c4c4c] rounded-[10px] shadow"/>
                    <div className="w-5 h-5 left-[13px] top-[113px] absolute"/>
                </div>

                <div
                    className="w-[264px] h-[41px] px-2.5 py-[11px] left-[1555px] top-[1486px] absolute bg-white rounded-md shadow justify-between items-center inline-flex">
                    <div className="justify-start items-center gap-0.5 flex">
                        <div className="text-center text-[#4c4c4c] text-sm font-semibold font-['Figtree']">Razdalja 1 km
                            od plaže
                        </div>
                    </div>
                    <div className="w-3 h-3 relative origin-top-left rotate-90"/>
                </div>
            </div>

        </>
    );
};

export default BeachPage;