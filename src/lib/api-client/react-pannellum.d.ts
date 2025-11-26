declare module 'react-pannellum' {
  import type * as React from 'react';

  export interface ReactPannellumConfig {
    autoLoad?: boolean;
    autoRotate?: number;
    [key: string]: unknown;
  }

  export interface ReactPannellumProps {
    id: string;
    sceneId: string;
    imageSource?: string;
    config?: ReactPannellumConfig;
    style?: React.CSSProperties;
    className?: string;
  }

  const ReactPannellum: React.ComponentType<ReactPannellumProps>;

  export default ReactPannellum;

  export function getConfig(): unknown;
}
