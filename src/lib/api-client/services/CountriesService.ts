/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CountriesService {
    /**
     * Get all countries that have beaches
     * Returns a list of countries that have at least one beach. Can be filtered by continent.
     * @param continent Filter by continent code (e.g., EU, AS, NA)
     * @returns any Successful operation
     * @throws ApiError
     */
    public static getCountries(
        continent?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            code?: string;
            name?: string;
            full_name?: string;
            iso3?: string;
            continent_code?: string;
            beaches_count?: number;
        }>;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/countries',
            query: {
                'continent': continent,
            },
            errors: {
                500: `Server error`,
            },
        });
    }
    /**
     * Get a specific country
     * Returns a specific country by code with its beaches count and continent information
     * @param code Country code (e.g., SI, US, DE)
     * @returns any Successful operation
     * @throws ApiError
     */
    public static getCountry(
        code: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            code?: string;
            name?: string;
            full_name?: string;
            iso3?: string;
            continent_code?: string;
            beaches_count?: number;
            continent?: {
                code?: string;
                name?: string;
            };
        };
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/countries/{code}',
            path: {
                'code': code,
            },
            errors: {
                404: `Country not found`,
            },
        });
    }
}
