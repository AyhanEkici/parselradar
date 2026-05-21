import { MapViewport } from './types';

const DEFAULT_VIEWPORT: MapViewport = {
  centerLat: 39.0,
  centerLng: 35.0,
  zoom: 1,
};

function key(scope: string, userId: string) {
  return `geo_viewport_${scope}_${userId}`;
}

export function loadViewport(scope: string, userId: string): MapViewport {
  if (typeof window === 'undefined') return DEFAULT_VIEWPORT;
  try {
    const raw = localStorage.getItem(key(scope, userId));
    if (!raw) return DEFAULT_VIEWPORT;
    const parsed = JSON.parse(raw) as MapViewport;
    if (!Number.isFinite(parsed.centerLat) || !Number.isFinite(parsed.centerLng) || !Number.isFinite(parsed.zoom)) {
      return DEFAULT_VIEWPORT;
    }
    return {
      centerLat: Math.max(-85, Math.min(85, parsed.centerLat)),
      centerLng: Math.max(-180, Math.min(180, parsed.centerLng)),
      zoom: Math.max(0.6, Math.min(6, parsed.zoom)),
    };
  } catch {
    return DEFAULT_VIEWPORT;
  }
}

export function saveViewport(scope: string, userId: string, viewport: MapViewport) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key(scope, userId), JSON.stringify(viewport));
}

export function clearViewport(scope: string, userId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key(scope, userId));
}

export const viewportDefaults = DEFAULT_VIEWPORT;
