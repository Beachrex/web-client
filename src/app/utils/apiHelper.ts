export const fetchFromApi = async <T>(countType: string): Promise<T> => {
    const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/beaches/counter?countType=${encodeURIComponent(countType)}`;

    try {
        const response = await fetch(url);

        // Cast response.json as unknown, then type it as T
        const data: T = await response.json() as unknown as T;

        if (!response.ok) {
            // Assuming `data` is an object and may have a `message` property
            const errorMessage = (data as { message?: string }).message ?? 'Error fetching data';  // Use ?? instead of ||
            throw new Error(errorMessage);
        }

        return data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(errorMessage);
    }
};
