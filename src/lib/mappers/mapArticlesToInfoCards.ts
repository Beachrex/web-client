// src/lib/mappers/mapArticlesToInfoCards.ts
import { buildCdnUrl } from '@/lib/utils/beach-images';

export interface InfoCard {
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}

export function mapArticlesToInfoCards(
  articles?: {
    title?: string | null;
    excerpt?: string | null;
    feature_image?: string | null;
    slug?: string | null;
  }[],
  locale?: string,
): InfoCard[] {
  return (
    articles
      ?.filter(
        (a) =>
          typeof a.title === 'string' &&
          typeof a.excerpt === 'string' &&
          typeof a.feature_image === 'string',
      )
      ?.map((a) => ({
        title: a.title!,
        subtitle: a.excerpt!,
        image: buildCdnUrl(a.feature_image, 'list')!,
        link: a.slug ? `/${locale}/articles/${a.slug}` : undefined,
      })) ?? []
  );
}
