/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Validation error response
 */
export type ValidationError = {
    /**
     * Error message
     */
    message?: string;
    /**
     * Field-specific validation errors
     */
    errors?: {
        latitude?: Array<string>;
    };
};

