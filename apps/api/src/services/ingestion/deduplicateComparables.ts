import { INGESTION_THRESHOLDS } from '../../config/ingestion/ingestionThresholds';
import type { NormalizedListing } from './normalizeListingData';

function isNear(left?: number, right?: number, tolerance = 0) {
  if (left === undefined || right === undefined) return false;
  return Math.abs(left - right) <= tolerance;
}

export function deduplicateComparables(listings: NormalizedListing[]): NormalizedListing[] {
  const unique: NormalizedListing[] = [];

  for (const listing of listings) {
    const duplicate = unique.find((candidate) =>
      candidate.city === listing.city &&
      candidate.district === listing.district &&
      isNear(candidate.areaM2, listing.areaM2, INGESTION_THRESHOLDS.dedupeTolerance.areaM2) &&
      isNear(candidate.pricePerM2, listing.pricePerM2, INGESTION_THRESHOLDS.dedupeTolerance.pricePerM2)
    );

    if (!duplicate) {
      unique.push(listing);
    }
  }

  return unique;
}
