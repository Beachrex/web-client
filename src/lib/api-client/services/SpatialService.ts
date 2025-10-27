/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SpatialService {
    /**
     * Find beaches within radius
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Beaches found within radius
     * @throws ApiError
     */
    public static getBeachesWithinRadius(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/beaches/within-radius',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Find nearest beaches
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Nearest beaches found
     * @throws ApiError
     */
    public static getNearestBeaches(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/beaches/nearest',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Calculate distance between two points
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Distance calculation result
     * @throws ApiError
     */
    public static calculateDistance(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/distance/calculate',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Get beaches within bounding box
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Beaches found within bounding box
     * @throws ApiError
     */
    public static getBeachesInBoundingBox(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/beaches/bounding-box',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Get beach density grid
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Beach density grid data
     * @throws ApiError
     */
    public static getBeachDensityGrid(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/beaches/density-grid',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
    /**
     * Get beach statistics
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns any Beach statistics
     * @throws ApiError
     */
    public static getBeachStatistics(
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/spatial/beaches/statistics',
            headers: {
                'Accept-Language': acceptLanguage,
            },
        });
    }
}
