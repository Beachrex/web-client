'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { DAY_COLORS, type MapStop } from '@/lib/utils/itinerary';

/** Plan map (AI-3): one colour per day, numbered stops in visiting order, a line for each day's route. */
export default function ItineraryMap({ stops, dayLabel }: { stops: MapStop[]; dayLabel: (day: number) => string }) {
  const bounds = useMemo(() => L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])), [stops]);
  const days = useMemo(() => [...new Set(stops.map((s) => s.day))], [stops]);
  const color = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length]!;

  const icon = (s: MapStop) =>
    L.divIcon({
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `<div style="${[
        `background:${color(s.day)}`,
        'color:#fff',
        'border:2px solid #fff',
        'border-radius:9999px',
        'width:28px',
        'height:28px',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'font:600 11px sans-serif',
        'box-shadow:0 1px 3px rgba(0,0,0,.4)',
      ].join(';')}">${s.day}.${s.order}</div>`,
    });

  return (
    <div>
      <MapContainer
bounds={bounds} boundsOptions={{ padding: [30, 30] }} scrollWheelZoom={false}
className="h-80 w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {days.map((day) => (
          <Polyline
            key={day}
            positions={stops.filter((s) => s.day === day).map((s) => [s.lat, s.lng] as [number, number])}
            pathOptions={{ color: color(day), weight: 3, opacity: 0.8 }}
          />
        ))}
        {stops.map((s) => (
          <Marker key={`${s.day}-${s.order}`} position={[s.lat, s.lng]} icon={icon(s)}>
            <Popup>
              <strong>{dayLabel(s.day)}</strong>
              <br />
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
        {days.map((day) => (
          <span key={day} className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: color(day) }} />
            {dayLabel(day)}
          </span>
        ))}
      </div>
    </div>
  );
}
