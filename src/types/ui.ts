// UI Component prop types

import type { ReactNode } from 'react';

// Layout types
export interface LayoutProps {
  children: ReactNode;
}

// Generic page props for Next.js 15+ with locale
export interface PageProps<T extends Record<string, string> = Record<string, never>> {
  params: Promise<{ locale: string } & T>;
}

// Component prop types
export interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export interface CardProps {
  title: string;
  description?: string;
  image?: string;
  children?: ReactNode;
  className?: string;
}

// Form types
export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  error?: string;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

