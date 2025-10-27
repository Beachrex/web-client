/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns RegisterResponse Successful registration
     * @throws ApiError
     */
    public static registerUser(
        requestBody: {
            name: string;
            email: string;
            password: string;
            password_confirmation: string;
        },
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<RegisterResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/register',
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
     * Login user and get API token
     * @param requestBody
     * @param acceptLanguage Language preference for the response (ISO 639-1 language codes)
     * @returns LoginResponse Login successful
     * @throws ApiError
     */
    public static loginUser(
        requestBody: LoginRequest,
        acceptLanguage: 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' = 'en',
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/login',
            headers: {
                'Accept-Language': acceptLanguage,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Invalid credentials`,
            },
        });
    }
    /**
     * Logout the currently authenticated user
     * **This endpoint requires an Authorization header with a Bearer token.** Example: `Authorization: Bearer YOUR_TOKEN`
     * @returns any Successful logout
     * @throws ApiError
     */
    public static logoutUser(): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/logout',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
