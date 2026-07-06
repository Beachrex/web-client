'use client';

import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';

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

  // High-resolution version for the fullscreen viewer (uses LARGE CDN endpoint)
  const primaryGalleryLargeUrl =
    buildCdnUrl(gallery[0]?.url ?? gallery[0]?.thumbnail_url, 'banner') ??
    primaryGalleryUrlTmp;

  const rawVideoUrl =
    (typeof embeds?.video_url === 'string' ? embeds.video_url : null) ??
    (videos[0]?.url ? buildCdnUrl(videos[0]?.url, 'video') : null) ??
    null;

  const videoEmbedUrl = rawVideoUrl ? buildYoutubeEmbedUrl(rawVideoUrl) : null;

  const sphereImageUrl =
    buildCdnUrl(spheres[0]?.thumbnail_url ?? spheres[0]?.url, 'gallery') ??
    primaryGalleryUrlTmp;

  // Get the virtual tour URL from the first sphere
  // Use buildSphereTourUrl to handle special characters in paths (č, š, ž, etc.)
  const sphereTourUrl = buildSphereTourUrl(spheres[0]?.tour_url);

  const hasGallery = gallery.length > 0;
  const hasVideo = Boolean(videoEmbedUrl);
  const hasSphere = spheres.length > 0 && Boolean(sphereTourUrl);

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
                        buildCdnUrl(rawSrc, 'banner') ??
                        primaryGalleryLargeUrl;
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
                            className="rounded-xl object-contain"
                          />
                        </div>
                      );
                    })}
                  </Carousel>
                ) : (
                  <Image
                    src={primaryGalleryLargeUrl}
                    alt={
                      beachDetails.basic_info?.name ?? 'Beach gallery image'
                    }
                    width={1600}
                    height={900}
                    className="h-[75vh] w-full rounded-xl object-contain"
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
            {activeMedia === 'sphere' && sphereTourUrl && (
              <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={sphereTourUrl}
                  title="360° Virtual Tour"
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
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
