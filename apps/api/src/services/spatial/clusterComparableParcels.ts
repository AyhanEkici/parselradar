import { geocodeProperty } from '../maps/geocodeProperty';
import { calculateDistanceToInfrastructure } from '../coordinates/calculateDistanceToInfrastructure';

export type SpatialComparable = {
  _id: string;
  il?: string;
  ilce?: string;
  areaM2?: number;
  pricePerM2?: number;
  latitude?: number;
  longitude?: number;
  coordinateSource?: 'exact' | 'approximate' | 'district_center_fallback';
  geocodeConfidence?: number;
};

export type ComparableClusterResult = {
  closeCount: number;
  midCount: number;
  broadCount: number;
  clusterStrength: number;
  plottedComparables: Array<{
    _id: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    pricePerM2?: number;
  }>;
};

export function clusterComparableParcels(input: {
  subject: { city?: string; district?: string; latitude?: number; longitude?: number; coordinateSource?: 'exact' | 'approximate' | 'district_center_fallback'; geocodeConfidence?: number };
  comparables: SpatialComparable[];
}): ComparableClusterResult {
  const subjectGeocode = geocodeProperty(input.subject);
  if (!subjectGeocode.coordinates) {
    return { closeCount: 0, midCount: 0, broadCount: 0, clusterStrength: 0, plottedComparables: [] };
  }

  const subjectCoordinates = subjectGeocode.coordinates;

  const plottedComparables = input.comparables
    .map((comparable) => {
      const geocoded = geocodeProperty({
        city: comparable.il,
        district: comparable.ilce,
        latitude: comparable.latitude,
        longitude: comparable.longitude,
        coordinateSource: comparable.coordinateSource,
        geocodeConfidence: comparable.geocodeConfidence,
      });
      const comparableCoordinates = geocoded.coordinates;
      if (!comparableCoordinates) return null;
      return {
        _id: comparable._id,
        latitude: comparableCoordinates.latitude,
        longitude: comparableCoordinates.longitude,
        distanceKm: calculateDistanceToInfrastructure(subjectCoordinates, comparableCoordinates),
        pricePerM2: comparable.pricePerM2,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 24);

  const closeCount = plottedComparables.filter((item) => item.distanceKm <= 3).length;
  const midCount = plottedComparables.filter((item) => item.distanceKm > 3 && item.distanceKm <= 10).length;
  const broadCount = plottedComparables.filter((item) => item.distanceKm > 10 && item.distanceKm <= 25).length;
  const clusterStrength = Math.max(0, Math.min(100, Math.round(closeCount * 14 + midCount * 7 + broadCount * 3)));

  return {
    closeCount,
    midCount,
    broadCount,
    clusterStrength,
    plottedComparables,
  };
}


