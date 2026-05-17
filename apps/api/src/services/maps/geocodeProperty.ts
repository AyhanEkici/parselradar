import { MUNICIPALITY_CENTERS } from '../../config/maps/municipalityCenters';
import { normalizeCoordinateData, type CoordinateSource, type NormalizedCoordinateData } from './normalizeCoordinateData';

export type GeocodeResult = {
  coordinates: NormalizedCoordinateData | null;
  geoConfidence: {
    level: CoordinateSource | 'unresolved';
    score: number;
  };
  fallbackUsed: boolean;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export function geocodeProperty(input: {
  city?: string;
  district?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  coordinateSource?: CoordinateSource;
  geocodeConfidence?: number;
}): GeocodeResult {
  const exact = normalizeCoordinateData({
    latitude: input.latitude,
    longitude: input.longitude,
    source: input.coordinateSource || 'exact',
    confidence: input.geocodeConfidence,
  });

  if (exact) {
    return {
      coordinates: exact,
      geoConfidence: { level: exact.source, score: exact.confidence },
      fallbackUsed: exact.source !== 'exact',
    };
  }

  const city = normalize(input.city);
  const district = normalize(input.district);
  const center = MUNICIPALITY_CENTERS.find((item) => normalize(item.city) === city && normalize(item.district) === district)
    || MUNICIPALITY_CENTERS.find((item) => normalize(item.city) === city && !item.district);

  if (!center) {
    return {
      coordinates: null,
      geoConfidence: { level: 'unresolved', score: 0 },
      fallbackUsed: true,
    };
  }

  const fallback = normalizeCoordinateData({
    latitude: center.latitude,
    longitude: center.longitude,
    source: 'district_center_fallback',
    confidence: center.confidence,
  });

  return {
    coordinates: fallback,
    geoConfidence: {
      level: fallback?.source || 'district_center_fallback',
      score: fallback?.confidence || center.confidence,
    },
    fallbackUsed: true,
  };
}
