// Generic API fetch function
export const fetchApiData = async <T>(endpoint: string, locale?: string, options?: RequestInit): Promise<T> => {
    const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${endpoint}`;

    // Get current locale from URL or default to 'en'
    const currentLocale = locale ?? (typeof window !== 'undefined' ?
        window.location.pathname.split('/')[1] ?? 'en' : 'en');

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': currentLocale === 'si' ? 'sl' : currentLocale, // Map 'si' to 'sl' for API
                ...options?.headers,
            },
            ...options,
        });

        const data: T = await response.json() as unknown as T;

        if (!response.ok) {
            const errorMessage = (data as { message?: string }).message ?? 'Error fetching data';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(errorMessage);
    }
};
