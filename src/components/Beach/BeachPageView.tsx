'use client';

import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';
import { buildBeachVideoUrl } from '@/lib/utils/beach-video';
import WindyWebcams from '@/components/Beach/WindyWebcams';
import MediaOverlay from '@/components/Beach/MediaOverlay';
import { FEATURES } from '@/lib/constants/features';
import { parseWebcamUrl, parseWindyWebcams } from '@/lib/utils/webcam';

interface BeachPageViewProps {
  beachDetails: BeachDetailsSchema;
}

type ActiveMediaType = 'gallery' | 'video' | 'sphere';

interface MediaCard {
  // 'webcam' opens the webcam page in a new tab instead of the modal.
  key: ActiveMediaType | 'webcam';
  src: string;
  icon: string;
  label: string;
}

const BeachPageView: React.FC<BeachPageViewProps> = ({ beachDetails }) => {
  const t = useTranslations('BeachDetails');
  const tUi = useTranslations('UI');

  // ✅ Hook vedno pokličemo, brez pogojev
  const [activeMedia, setActiveMedia] =
    React.useState<ActiveMediaType | null>(null);
  const closeMedia = React.useCallback(() => setActiveMedia(null), []);

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

  // Same rule as the map/list cards (QA #67).
  const videoEmbedUrl = buildBeachVideoUrl(embeds?.video_url, videos);

  const sphereImageUrl =
    buildCdnUrl(spheres[0]?.thumbnail_url ?? spheres[0]?.url, 'gallery') ??
    primaryGalleryUrlTmp;

  // Get the virtual tour URL from the first sphere
  // Use buildSphereTourUrl to handle special characters in paths (č, š, ž, etc.)
  const sphereTourUrl = buildSphereTourUrl(spheres[0]?.tour_url);

  const hasGallery = gallery.length > 0;
  const hasVideo = Boolean(videoEmbedUrl);
  const hasSphere = spheres.length > 0 && Boolean(sphereTourUrl);

  // TASK-006: verified Windy webcams get their own section with the player; the old
  // pasted-link card (QA #36) only while FEATURES.windyWebcams is off.
  const windyWebcams = FEATURES.windyWebcams
    ? parseWindyWebcams((beachDetails as { webcams?: unknown }).webcams)
    : [];
  const webcamUrl = FEATURES.windyWebcams ? null : parseWebcamUrl(embeds?.webcam);

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
    {
      key: 'webcam',
      src: '/images/beachmedia/live-cam.jpg',
      icon: '/images/beachmedia/play-button-arrowhead.svg',
      label: t('beachMediaLiveCam'),
      enabled: Boolean(webcamUrl),
    },
  ];

  const mediaItems: MediaCard[] = rawItems.filter((i) => i.enabled);


  const webcamSection = (
    <WindyWebcams webcams={windyWebcams} beachName={beachDetails.basic_info?.name} />
  );

  if (mediaItems.length === 0) {
    return webcamSection;
  }

  return (
    <>
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
                onClick={() => {
                  if (item.key === 'webcam') {
                    if (webcamUrl) window.open(webcamUrl, '_blank', 'noopener,noreferrer');
                    return;
                  }
                  setActiveMedia(item.key);
                }}
                className="relative z-10 flex h-[45px] items-center gap-[10px] rounded-[8px] bg-white px-[16px] py-[9px] text-center font-figtree text-[14px] font-bold leading-none text-gray-700 shadow"
              >
                <Image
                  src={item.icon}
                  alt=""
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
        <MediaOverlay
          label={rawItems.find((item) => item.key === activeMedia)?.label ?? t('beachMediaGallery')}
          closeLabel={t('closeMedia')}
          onClose={closeMedia}
        >

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
                    title={tUi('videoTitle')}
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
                  title={tUi('virtualTourTitle')}
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
        </MediaOverlay>
      )}
    </section>
    {webcamSection}
    </>
  );
};

export default BeachPageView;
