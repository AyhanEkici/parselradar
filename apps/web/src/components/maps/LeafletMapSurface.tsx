import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LayerBuilder = (context: { L: typeof L; map: L.Map }) => L.LayerGroup;

type Props = {
  center: { latitude: number; longitude: number };
  zoom?: number;
  heightClassName?: string;
  layerBuilder: LayerBuilder;
};

export const LeafletMapSurface: React.FC<Props> = ({ center, zoom = 12, heightClassName = 'h-64', layerBuilder }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([center.latitude, center.longitude], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      layerGroupRef.current?.remove();
      layerGroupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [center.latitude, center.longitude, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.latitude, center.longitude], zoom);
  }, [center.latitude, center.longitude, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    layerGroupRef.current?.remove();
    const group = layerBuilder({ L, map: mapRef.current });
    group.addTo(mapRef.current);
    layerGroupRef.current = group;
  }, [center.latitude, center.longitude, layerBuilder]);

  return <div ref={containerRef} className={`w-full overflow-hidden rounded-xl border border-slate-200 ${heightClassName}`} />;
};
