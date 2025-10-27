'use client';
import Image from 'next/image';
import React from 'react';

interface Badge {
  label: string;
  icon: string;
}

interface BottomBadgesProps {
  leftBadges: Badge[];
  rightBadges: Badge[];
}

const BadgeItem: React.FC<Badge> = ({ label, icon }) => (
  <div className="flex h-[32px] items-center gap-[8px] rounded-[16px] bg-[#5E1CA5] px-[10px] py-[3px]">
    <Image
src={icon} alt={label} width={20}
height={20}
    />
    <span className="font-figtree text-[16px] font-bold leading-[100%] text-white">
      {label}
    </span>
  </div>
);

const BottomBadges: React.FC<BottomBadgesProps> = ({
  leftBadges,
  rightBadges,
}) => {
  return (
    <div className="ml-[100px] mt-6 flex gap-[20px]">
      {/* Levi kontejner */}
      <div className="grid grid-cols-3 grid-rows-2 gap-[10px]">
        {leftBadges.map((b, i) => (
          <BadgeItem key={i} {...b} />
        ))}
      </div>

      {/* Desni kontejner */}
      <div className="grid grid-cols-3 grid-rows-2 gap-[10px]">
        {rightBadges.map((b, i) => (
          <BadgeItem key={i} {...b} />
        ))}
      </div>
    </div>
  );
};

export default BottomBadges;
