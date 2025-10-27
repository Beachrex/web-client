/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContinentsService {
    /**
     * Get all continents that have beaches
     * Returns a list of continents that have at least one beach
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Successful operation
     * @throws ApiError
     */
    public static getContinents(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            code?: string;
            name?: string;
            beaches_count?: number;
        }>;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/continents',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Get a specific continent
     * Returns a specific continent by code with its beaches count
     * @param code Continent code (e.g., EU, AS, NA)
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Successful operation
     * @throws ApiError
     */
    public static getContinent(
        code: string,
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            code?: string;
            name?: string;
            beaches_count?: number;
        };
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/continents/{code}',
            path: {
                'code': code,
            },
            headers: {
                'Accept-Language': acceptLanguage,
            },
            errors: {
                404: `Continent not found`,
            },
        });
    }
}
