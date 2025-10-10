// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Continent {
  code: string;
  name: string;
  beaches_count: number;
  icon_path?: string;
  description?: string;
}

export interface Country {
  code: string;
  name: string;
  full_name: string;
  iso3: string;
  continent_code: string;
  beaches_count: number;
  image_path?: string;
  description?: string;
  continent?: Continent;
}

export interface Beach {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  continent_code: string;
  country_code: string;
  beaches_count?: number;
}
