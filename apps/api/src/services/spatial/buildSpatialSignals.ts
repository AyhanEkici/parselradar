export function buildSpatialSignals(input: {
  nearbyInfrastructure: Array<{ type: string; name: string; distanceKm: number }>;
  opportunitySignals: string[];
  spatialLiquidity: { score: number; label: string };
  clusterStrength: number;
  geoConfidence: { level: string; score: number };
}): string[] {
  const signals = [
    ...input.opportunitySignals,
    input.spatialLiquidity.label === 'liquid' ? 'high_spatial_liquidity' : input.spatialLiquidity.label === 'balanced' ? 'moderate_spatial_liquidity' : 'thin_spatial_liquidity',
    input.clusterStrength >= 60 ? 'strong_comparable_cluster' : input.clusterStrength >= 35 ? 'moderate_comparable_cluster' : 'weak_comparable_cluster',
    input.geoConfidence.level !== 'exact' ? 'fallback_coordinates_used' : 'exact_coordinates_used',
  ];

  for (const item of input.nearbyInfrastructure.slice(0, 4)) {
    signals.push(`${item.type}_within_${Math.max(1, Math.round(item.distanceKm))}km`);
  }

  return Array.from(new Set(signals));
}
