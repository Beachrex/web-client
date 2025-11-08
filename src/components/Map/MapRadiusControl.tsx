'use client';

import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { useTranslations } from 'next-intl';
import { RadiusIcon } from '@/components/Icons/LayoutIcons';

interface MapRadiusControlProps {
  radius?: number;
}

const MapRadiusControl: React.FC<MapRadiusControlProps> = ({
  radius = 100,
}) => {
  const map = useMap();
  const t = useTranslations('BeachesMap');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Update input value when radius changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(radius);
    }
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const RadiusControl = L.Control.extend({
      options: {
        position: 'topright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.backgroundColor = 'white';
        container.style.padding = '5px 10px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '6px';

        // Add radius icon
        const iconWrapper = L.DomUtil.create('span', '', container);
        iconWrapper.innerHTML = ReactDOMServer.renderToStaticMarkup(<RadiusIcon />);
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';

        const label = L.DomUtil.create('span', '', container);
        label.textContent = t('radiusLabel');

        const input = L.DomUtil.create('input', '', container);
        inputRef.current = input;
        input.type = 'text';
        input.value = String(radius);
        input.readOnly = true;
        input.disabled = true;
        input.style.width = '60px';
        input.style.height = '20px';
        input.style.padding = '2px 4px';
        input.style.backgroundColor = '#f3f4f6';
        input.style.cursor = 'default';

        const unit = L.DomUtil.create('span', '', container);
        unit.textContent = 'km';

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
      },
    });

    const radiusControl = new RadiusControl();
    map.addControl(radiusControl);

    return () => {
      map.removeControl(radiusControl);
    };
  }, [map, t, radius]);

  return null;
};

export default MapRadiusControl;

