/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeachSchema } from '../models/BeachSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeachesService {
    /**
     * List all beaches
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns BeachSchema List of beaches
     * @throws ApiError
     */
    public static getBeaches(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<Array<BeachSchema>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/beaches',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Create a new beach
     * @param requestBody
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns BeachSchema Beach created
     * @throws ApiError
     */
    public static createBeach(
        requestBody: {
            name: string;
            latitude: number;
            longitude: number;
            translations: Array<{
                locale?: string;
                name?: string;
                description?: string;
                slug?: string;
            }>;
        },
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<BeachSchema> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/beaches',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * Get a single beach by ID
     * @param id Beach ID
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns BeachSchema Beach found
     * @throws ApiError
     */
    public static getBeachById(
        id: number,
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<BeachSchema> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/beaches/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Accept-Language': acceptLanguage,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
}
