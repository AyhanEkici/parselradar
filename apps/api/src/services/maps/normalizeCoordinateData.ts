export type CoordinateSource = 'exact' | 'approximate' | 'district_center_fallback';

export type NormalizedCoordinateData = {
  latitude: number;
  longitude: number;
  source: CoordinateSource;
  confidence: number;
};

function toNumber(value?: number | string | null) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
}

function isTurkeyBounds(latitude: number, longitude: number) {
  return latitude >= 35 && latitude <= 43 && longitude >= 25 && longitude <= 45;
}

export function normalizeCoordinateData(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  source?: CoordinateSource;
  confidence?: number;
}): NormalizedCoordinateData | null {
  const latitude = toNumber(input.latitude);
  const longitude = toNumber(input.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!isTurkeyBounds(latitude, longitude)) return null;

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    source: input.source || 'exact',
    confidence: Math.max(0, Math.min(100, Math.round(input.confidence ?? (input.source === 'district_center_fallback' ? 38 : input.source === 'approximate' ? 62 : 96)))),
  };
}
