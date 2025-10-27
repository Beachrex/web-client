/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Get current authenticated user
     * **This endpoint requires an Authorization header with a Bearer token.** Example: `Authorization: Bearer YOUR_TOKEN`
     * @returns User Authenticated user info
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/user',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
