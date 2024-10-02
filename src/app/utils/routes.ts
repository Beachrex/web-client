export const routes: Record<string, Record<string, string>> = {
    about: {
        en: '/about',
        si: '/o-nas'
    }
};

// Function to dynamically translate slugs based on the target locale
export function translateSlug(slug: string, targetLocale: string): string {
    // If slug has a translation, return the translated version; otherwise, return the same slug
    return routes[slug]?.[targetLocale] ?? slug;
}

// Helper function to switch the language and translate the path
export function getTranslatedPath(pathname: string, targetLocale: string): string {
    // Split the pathname to extract the language part and the slug part
    const pathParts = pathname.split('/').filter(Boolean); // Remove empty parts

    // const currentLocale = pathParts[0]; // First part is the current locale
    const slugParts = pathParts.slice(0); // The rest are slugs
    console.log("slugParts")
    console.log(slugParts)
    // If there's no slug (e.g. /en), return the base URL for the new locale
    if (slugParts.length === 0) {
        return `/${targetLocale}`;
    }

    // Translate each part of the slug dynamically
    const translatedSlugParts = slugParts.map((slug) => translateSlug(slug, targetLocale));
    console.log("translatedSlugParts")
    console.log(translatedSlugParts)
    // Rebuild the URL with the target locale and translated slugs
    return `${translatedSlugParts.join('/')}`;
}