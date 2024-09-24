// utils/apiHelper.ts
export const fetchFromApi = async <T>(countType: string): Promise<T> => {
    const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/beaches/counter?countType=${countType}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching data');
        }

        return data;
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(errorMessage);
    }
};
