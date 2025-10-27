// Central export point for all types
// Import all types from here: import { Continent, Beach } from '@/types'

// API types from generated OpenAPI client
export type { Continent } from '@/lib/api-client/models/Continent';
export type { Country } from '@/lib/api-client/models/Country';
export type { BeachSchema as Beach } from '@/lib/api-client/models/BeachSchema';

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Domain types (frontend-only)
export type {
  ContinentWithUI,
  CountryWithUI,
  MapViewport,
  MapMarker,
  BeachFilter,
  FilterState,
  SearchParams,
} from './domain';

// UI types (component props)
export type {
  LayoutProps,
  PageProps,
  ButtonProps,
  CardProps,
  FormFieldProps,
  NavigationItem,
} from './ui';

