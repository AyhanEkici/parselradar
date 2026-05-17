import { geocodeProperty } from '../maps/geocodeProperty';
import { buildMapSummary } from '../maps/buildMapSummary';
import { detectNearbyInfrastructure } from '../coordinates/detectNearbyInfrastructure';
import { calculateRegionalCluster } from '../coordinates/calculateRegionalCluster';
import { clusterComparableParcels, type SpatialComparable } from './clusterComparableParcels';
import { detectSpatialOpportunity } from './detectSpatialOpportunity';
import { calculateSpatialLiquidity } from './calculateSpatialLiquidity';
import { buildSpatialSignals } from './buildSpatialSignals';

export type SpatialIntelligenceOutput = {
  coordinates: {
    latitude: number;
    longitude: number;
    source: 'exact' | 'approximate' | 'district_center_fallback';
  } | null;
  nearbyInfrastructure: Array<{ id: string; name: string; type: string; distanceKm: number; city: string }>;
  infrastructureDistances: {
    airport?: number;
    industrial_zone?: number;
    university?: number;
    hospital?: number;
    road_corridor?: number;
    tourism_zone?: number;
  };
  spatialSignals: string[];
  spatialLiquidity: { score: number; label: 'thin' | 'balanced' | 'liquid' };
  clusterStrength: number;
  geoConfidence: { level: 'exact' | 'approximate' | 'district_center_fallback' | 'unresolved'; score: number };
  mapSummary: string;
  comparableMapPoints: Array<{ _id: string; latitude: number; longitude: number; distanceKm: number; pricePerM2?: number }>;
  regionalCluster: {
    municipality?: { city: string; district?: string; distanceKm: number };
    roadCluster?: { name: string; distanceKm: number };
    clusterLabel: string;
  };
};

export function buildSpatialIntelligence(input: {
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  coordinateSource?: 'exact' | 'approximate' | 'district_center_fallback';
  geocodeConfidence?: number;
  zoningStatus?: string;
  comparables: SpatialComparable[];
}): SpatialIntelligenceOutput {
  const geocode = geocodeProperty({
    city: input.city,
    district: input.district,
    latitude: input.latitude,
    longitude: input.longitude,
    coordinateSource: input.coordinateSource,
    geocodeConfidence: input.geocodeConfidence,
  });

  if (!geocode.coordinates) {
    return {
      coordinates: null,
      nearbyInfrastructure: [],
      infrastructureDistances: {},
      spatialSignals: ['unresolved_coordinates'],
      spatialLiquidity: { score: 0, label: 'thin' },
      clusterStrength: 0,
      geoConfidence: geocode.geoConfidence,
      mapSummary: 'No resolved coordinates available for map intelligence.',
      comparableMapPoints: [],
      regionalCluster: { clusterLabel: 'unresolved_cluster' },
    };
  }

  const infrastructure = detectNearbyInfrastructure(geocode.coordinates, input.city);
  const regionalCluster = calculateRegionalCluster(geocode.coordinates, input.city, input.district);
  const comparableClusters = clusterComparableParcels({
    subject: {
      city: input.city,
      district: input.district,
      latitude: geocode.coordinates.latitude,
      longitude: geocode.coordinates.longitude,
      coordinateSource: geocode.coordinates.source,
      geocodeConfidence: geocode.coordinates.confidence,
    },
    comparables: input.comparables,
  });

  const spatialLiquidity = calculateSpatialLiquidity({
    clusterStrength: comparableClusters.clusterStrength,
    comparableCount: comparableClusters.plottedComparables.length,
    roadDistanceKm: regionalCluster.roadCluster?.distanceKm,
    municipalityDistanceKm: regionalCluster.municipality?.distanceKm,
  });

  const opportunity = detectSpatialOpportunity({
    infrastructureDistances: infrastructure.infrastructureDistances,
    clusterStrength: comparableClusters.clusterStrength,
    zoningStatus: input.zoningStatus,
  });

  const spatialSignals = buildSpatialSignals({
    nearbyInfrastructure: infrastructure.nearbyInfrastructure,
    opportunitySignals: opportunity.signals,
    spatialLiquidity,
    clusterStrength: comparableClusters.clusterStrength,
    geoConfidence: geocode.geoConfidence,
  });

  const mapSummary = buildMapSummary({
    geoConfidence: geocode.geoConfidence,
    nearbyInfrastructure: infrastructure.nearbyInfrastructure,
    clusterStrength: comparableClusters.clusterStrength,
    spatialLiquidity,
    spatialSignals,
  });

  return {
    coordinates: {
      latitude: geocode.coordinates.latitude,
      longitude: geocode.coordinates.longitude,
      source: geocode.coordinates.source,
    },
    nearbyInfrastructure: infrastructure.nearbyInfrastructure,
    infrastructureDistances: infrastructure.infrastructureDistances,
    spatialSignals,
    spatialLiquidity,
    clusterStrength: comparableClusters.clusterStrength,
    geoConfidence: geocode.geoConfidence,
    mapSummary,
    comparableMapPoints: comparableClusters.plottedComparables,
    regionalCluster,
  };
}
