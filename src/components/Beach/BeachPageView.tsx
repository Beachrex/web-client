'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

const BeachPageView: React.FC = () => {
  const t = useTranslations('HomePage');

  const mediaItems = [
    {
      src: '/images/beachmedia/beach-gallery.jpg',
      icon: '/images/beachmedia/gallery-icon.png',
      label: t('beachMediaGallery'),
    },
    {
      src: '/images/beachmedia/live-cam.jpg',
      icon: '/images/beachmedia/play-button-arrowhead.png',
      label: t('beachMediaVideo'),
    },
    {
      src: '/images/beachmedia/live-cam.jpg',
      icon: '/images/beachmedia/360-degree.png',
      label: t('beachMedia360'),
    },
    {
      src: '/images/beachmedia/live-cam.jpg',
      icon: '/images/beachmedia/video-icon.png',
      label: t('beachMediaLiveCam'),
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {mediaItems.map((item, idx) => (
            <div
              key={idx}
              className="relative flex h-[233px] w-full items-center justify-center overflow-hidden rounded-lg"
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button className="relative z-10 flex h-[45px] items-center gap-[10px] rounded-[8px] bg-white px-[16px] py-[9px] text-center font-figtree text-[14px] font-bold leading-none text-gray-700 shadow">
                <Image
                  src={item.icon}
                  alt={`${item.label} icon`}
                  width={20}
                  height={20}
                />
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeachPageView;
