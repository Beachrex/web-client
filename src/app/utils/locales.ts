export const locales = ['en', 'si'] as const; // Using 'as const' for better type inference
export type Locale = typeof locales[number]; // Extract the literal types
