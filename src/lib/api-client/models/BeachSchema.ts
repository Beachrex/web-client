/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Beach API Resource
 */
export type BeachSchema = {
  id?: number;
  user_id?: number;
  status?: string;
  name?: string;
  description?: string;

  /**
   * NOTE: list endpoint returns coords as strings -> allow both
   */
  latitude?: number | string;
  longitude?: number | string;

  /** Extra fields present in /api/v1/beaches list */
  slug?: string;
  country_code?: string;
  country_name?: string;
  continent_code?: string;
  main_image?: string;

  created_at?: string;
  updated_at?: string;
};
