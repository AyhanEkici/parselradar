import { INGESTION_SOURCES } from '../../config/ingestion/ingestionSources';
import { deduplicateComparables } from './deduplicateComparables';
import { normalizeListingData, type RawListing } from './normalizeListingData';

export function ingestComparableListings(input: { sourceRows: RawListing[] }) {
  const normalized = input.sourceRows.map((listing) =>
    normalizeListingData({ listing, source: INGESTION_SOURCES.comparableListings.key })
  );

  const deduplicated = deduplicateComparables(normalized);

  return {
    source: INGESTION_SOURCES.comparableListings.key,
    sourceConfidence: INGESTION_SOURCES.comparableListings.confidence,
    ingestedCount: deduplicated.length,
    droppedCount: normalized.length - deduplicated.length,
    listings: deduplicated,
    signals: deduplicated.length > 0 ? ['comparable_feed_loaded'] : ['comparable_feed_empty'],
  };
}
