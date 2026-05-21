import React, { useEffect, useMemo, useRef } from 'react';
import { GeoLayerRecord, GeoOverlayItem, GeoServiceDiagnostics, MapRenderDiagnostics, MapViewport } from './types';

type Point = { x: number; y: number };

function lonToX(lon: number, viewport: MapViewport) {
  const normalized = ((lon - viewport.centerLng) / 360) * (100 * viewport.zoom) + 50;
  return Math.max(-200, Math.min(300, normalized));
}

function latToY(lat: number, viewport: MapViewport) {
  const normalized = 25 - ((lat - viewport.centerLat) / 180) * (50 * viewport.zoom);
  return Math.max(-100, Math.min(150, normalized));
}

function colorFor(overlay: GeoOverlayItem) {
  switch (overlay.overlayType) {
    case 'parcel_analysis':
      return '#2563eb';
    case 'municipality':
      return '#0ea5e9';
    case 'zoning':
      return '#7c3aed';
    case 'infrastructure':
      return '#16a34a';
    case 'transport':
      return '#dc2626';
    case 'environmental':
      return '#059669';
    case 'investment':
      return '#d97706';
    case 'organization':
      return '#475569';
    default:
      return '#64748b';
  }
}

function layerCrsMismatch(layer: GeoLayerRecord) {
  const projection = (layer.projection || []).map((item) => item.toUpperCase());
  return projection.length > 0 && !projection.includes('EPSG:4326') && !projection.includes('CRS:84') && !projection.includes('EPSG:3857');
}

export default function GeoAnalysisOverlay({
  viewport,
  layers,
  overlays,
  selectedOverlayId,
  compareMode,
  serviceDiagnostics,
  onSelectOverlay,
  onViewportChange,
  onDiagnostics,
}: {
  viewport: MapViewport;
  layers: GeoLayerRecord[];
  overlays: GeoOverlayItem[];
  selectedOverlayId?: string;
  compareMode: boolean;
  serviceDiagnostics: GeoServiceDiagnostics[];
  onSelectOverlay: (overlayId: string) => void;
  onViewportChange: (next: MapViewport) => void;
  onDiagnostics: (diag: MapRenderDiagnostics) => void;
}) {
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const visibleLayers = useMemo(() => layers.filter((layer) => layer.visibility), [layers]);

  const points = useMemo(() => {
    return overlays
      .filter((overlay) => Number.isFinite(overlay.lat) && Number.isFinite(overlay.lng))
      .map((overlay) => ({
        overlay,
        point: {
          x: lonToX(Number(overlay.lng), viewport),
          y: latToY(Number(overlay.lat), viewport),
        } as Point,
      }));
  }, [overlays, viewport]);

  useEffect(() => {
    const startedAt = performance.now();

    const unavailableProviders = serviceDiagnostics.filter((item) => !item.available).map((item) => `${item.provider}:${item.service}`);
    const failedLayerLoads = visibleLayers.filter((layer) => layer.healthState === 'UNAVAILABLE').map((layer) => layer.title);
    const emptyLayerResponses = visibleLayers.filter((layer) => !layer.bbox).map((layer) => layer.title);
    const unsupportedProjectionLayers = visibleLayers.filter(layerCrsMismatch).map((layer) => layer.title);
    const crsMismatches = visibleLayers.filter(layerCrsMismatch).map((layer) => `${layer.title} (${(layer.projection || []).join(', ')})`);
    const timeoutLayers = serviceDiagnostics.filter((item) => item.available && item.latencyMs > 3000).map((item) => `${item.service}:${item.endpoint}`);

    const tileFailures = unavailableProviders.length + failedLayerLoads.length + timeoutLayers.length;
    const successfulTileRequests = Math.max(0, visibleLayers.length - failedLayerLoads.length);

    onDiagnostics({
      overlayRenderLatencyMs: performance.now() - startedAt,
      tileFailures,
      timeoutLayers,
      emptyLayerResponses,
      crsMismatches,
      unsupportedProjectionLayers,
      unavailableProviders,
      failedLayerLoads,
      successfulTileRequests,
    });
  }, [onDiagnostics, serviceDiagnostics, visibleLayers]);

  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    onViewportChange({ ...viewport, zoom: Math.max(0.6, Math.min(6, viewport.zoom + delta)) });
  };

  const onMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };

    onViewportChange({
      ...viewport,
      centerLng: Math.max(-180, Math.min(180, viewport.centerLng - dx / (viewport.zoom * 4))),
      centerLat: Math.max(-85, Math.min(85, viewport.centerLat + dy / (viewport.zoom * 4))),
    });
  };

  const onMouseUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-semibold text-slate-900">Geo Analysis Overlay</div>
      <p className="mb-3 text-xs text-slate-600">Real overlay rendering with multi-layer stacking, opacity blending and active analysis highlight.</p>
      <div className="rounded border border-slate-300 bg-slate-50 p-2">
        <svg
          viewBox="0 0 100 50"
          className="h-[420px] w-full cursor-grab"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <rect x="0" y="0" width="100" height="50" fill="#f8fafc" stroke="#cbd5e1" />
          {Array.from({ length: 11 }).map((_, index) => (
            <line key={`grid-v-${index}`} x1={index * 10} y1={0} x2={index * 10} y2={50} stroke="#e2e8f0" strokeWidth={0.1} />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line key={`grid-h-${index}`} x1={0} y1={index * 10} x2={100} y2={index * 10} stroke="#e2e8f0" strokeWidth={0.1} />
          ))}

          {visibleLayers
            .filter((layer) => layer.bbox)
            .map((layer) => {
              const bbox = layer.bbox!;
              const x1 = lonToX(bbox.minx, viewport);
              const y1 = latToY(bbox.maxy, viewport);
              const x2 = lonToX(bbox.maxx, viewport);
              const y2 = latToY(bbox.miny, viewport);
              const w = Math.max(0.4, x2 - x1);
              const h = Math.max(0.4, y2 - y1);
              const stroke = layer.healthState === 'HEALTHY' ? '#2563eb' : layer.healthState === 'DEGRADED' ? '#d97706' : '#dc2626';
              return (
                <g key={layer.id}>
                  <rect
                    x={x1}
                    y={y1}
                    width={w}
                    height={h}
                    fill="rgba(37,99,235,0.12)"
                    stroke={stroke}
                    strokeDasharray={compareMode ? '0.8 0.4' : undefined}
                    opacity={Math.max(0.12, layer.opacity)}
                  />
                  <title>{layer.title}</title>
                </g>
              );
            })}

          {points.map(({ overlay, point }) => {
            const selected = selectedOverlayId === overlay.id;
            const radius = selected ? 1.2 : 0.7;
            return (
              <g key={overlay.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  fill={colorFor(overlay)}
                  stroke={selected ? '#0f172a' : 'white'}
                  strokeWidth={selected ? 0.25 : 0.15}
                  onClick={() => onSelectOverlay(overlay.id)}
                  role="button"
                />
                <title>{overlay.label}</title>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-slate-600">
        viewport: lat {viewport.centerLat.toFixed(3)} | lng {viewport.centerLng.toFixed(3)} | zoom {viewport.zoom.toFixed(2)}
      </div>
    </div>
  );
}
