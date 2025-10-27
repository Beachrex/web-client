/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Continent } from './Continent';
/**
 * Country model
 */
export type Country = {
    /**
     * Two-letter country code (ISO 3166-1 alpha-2)
     */
    code?: string;
    /**
     * Country name
     */
    name?: string;
    /**
     * Full official country name
     */
    full_name?: string;
    /**
     * Three-letter country code (ISO 3166-1 alpha-3)
     */
    iso3?: string;
    /**
     * Two-letter continent code
     */
    continent_code?: string;
    /**
     * Number of beaches in this country
     */
    beaches_count?: number;
    continent?: Continent;
    image_path?: string;
};

