'use client';

import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';

// disable SSR for pannellum viewer
const ReactPannellum = dynamic(() => import('react-pannellum'), {
  ssr: false,
});

interface BeachPageViewProps {
  beachDetails: BeachDetailsSchema;
}

type ActiveMediaType = 'gallery' | 'video' | 'sphere';

interface MediaCard {
  key: ActiveMediaType;
  src: string;
  icon: string;
  label: string;
}

const buildYoutubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';

  if (rawUrl.includes('youtu.be/')) {
    return rawUrl.replace('youtu.be/', 'www.youtube.com/embed/');
  }

  if (rawUrl.includes('youtube.com/watch')) {
    const url = new URL(rawUrl);
    const v = url.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
  }

  return rawUrl;
};

const BeachPageView: React.FC<BeachPageViewProps> = ({ beachDetails }) => {
  const t = useTranslations('BeachDetails');

  // ✅ Hook vedno pokličemo, brez pogojev
  const [activeMedia, setActiveMedia] =
    React.useState<ActiveMediaType | null>(null);

  const media = beachDetails.media;
  const embeds = beachDetails.embeds;

  const gallery = media?.gallery ?? [];
  const videos = media?.videos ?? [];
  const spheres = media?.spheres_360 ?? [];

  const primaryGalleryUrlTmp =
    buildCdnUrl(gallery[0]?.thumbnail_url ?? gallery[0]?.url, 'gallery') ??
    '/images/beachmedia/beach-gallery.jpg';

  const rawVideoUrl =
    (typeof embeds?.video_url === 'string' ? embeds.video_url : null) ??
    (videos[0]?.url ? buildCdnUrl(videos[0]?.url, 'video') : null) ??
    null;

  const videoEmbedUrl = rawVideoUrl ? buildYoutubeEmbedUrl(rawVideoUrl) : null;

  const sphereImageUrl =
    buildCdnUrl(spheres[0]?.thumbnail_url ?? spheres[0]?.url, 'gallery') ??
    primaryGalleryUrlTmp;

  const hasGallery = gallery.length > 0;
  const hasVideo = Boolean(videoEmbedUrl);
  const hasSphere = spheres.length > 0;

  const rawItems: (MediaCard & { enabled: boolean })[] = [
    {
      key: 'gallery',
      src: primaryGalleryUrlTmp,
      icon: '/images/beachmedia/gallery-icon.svg',
      label: t('beachMediaGallery'),
      enabled: hasGallery,
    },
    {
      key: 'video',
      src: sphereImageUrl,
      icon: '/images/beachmedia/play-button-arrowhead.svg',
      label: t('beachMediaVideo'),
      enabled: hasVideo,
    },
    {
      key: 'sphere',
      src: sphereImageUrl,
      icon: '/images/beachmedia/360-degree.svg',
      label: t('beachMedia360'),
      enabled: hasSphere,
    },
  ];

  const mediaItems: MediaCard[] = rawItems.filter((i) => i.enabled);

  // ✅ Navadna zgodnja vrnitev je ok – hook je zgoraj že poklican
  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item) => (
            <div
              key={item.key}
              className="relative flex h-[233px] w-full items-center justify-center overflow-hidden rounded-lg"
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />

              <button
                type="button"
                onClick={() => setActiveMedia(item.key)}
                className="relative z-10 flex h-[45px] items-center gap-[10px] rounded-[8px] bg-white px-[16px] py-[9px] text-center font-figtree text-[14px] font-bold leading-none text-gray-700 shadow"
              >
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

      {/* MODAL OVERLAY */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-6xl rounded-xl bg-[#111] shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveMedia(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white hover:bg-black"
            >
              ✕
            </button>

            {/* GALLERY FULLSCREEN + CAROUSEL */}
            {activeMedia === 'gallery' && hasGallery && (
              <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
                {gallery.length > 1 ? (
                  <Carousel slide={false} className="h-full w-full">
                    {gallery.map((img) => {
                      const rawSrc = img.url ?? img.thumbnail_url;
                      const src =
                        buildCdnUrl(rawSrc, 'gallery') ??
                        primaryGalleryUrlTmp;
                      const key = String(img.id ?? src);

                      return (
                        <div key={key} className="relative h-[75vh] w-full">
                          <Image
                            src={src}
                            alt={
                              beachDetails.basic_info?.name ??
                              'Beach gallery image'
                            }
                            fill
                            className="rounded-xl object-cover"
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                ) : (
                  <Image
                    src={primaryGalleryUrlTmp}
                    alt={
                      beachDetails.basic_info?.name ?? 'Beach gallery image'
                    }
                    width={1600}
                    height={900}
                    className="h-[75vh] w-full rounded-xl object-cover"
                  />
                )}
              </div>
            )}

            {/* VIDEO (YouTube embed) */}
            {activeMedia === 'video' && videoEmbedUrl && (
              <div className="relative w-full overflow-hidden rounded-xl">
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    src={videoEmbedUrl}
                    title="Video"
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* 360° VIEWER */}
            {activeMedia === 'sphere' && sphereImageUrl && (
              <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
                <ReactPannellum
                  id="sphere-viewer"
                  sceneId="sphere-scene"
                  imageSource={sphereImageUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#000000',
                  }}
                  config={{
                    autoLoad: true,
                    autoRotate: -1,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BeachPageView;
