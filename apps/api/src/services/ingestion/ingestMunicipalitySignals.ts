import { INGESTION_SOURCES } from '../../config/ingestion/ingestionSources';
import { MUNICIPALITY_MAPPINGS } from '../../config/ingestion/municipalityMappings';

export function ingestMunicipalitySignals(input: { city?: string; district?: string }) {
  const city = (input.city || '').toLowerCase();
  const district = (input.district || '').toLowerCase();
  const mappedDistricts = (MUNICIPALITY_MAPPINGS[city as keyof typeof MUNICIPALITY_MAPPINGS] || []) as readonly string[];
  const matched = mappedDistricts.includes(district);

  return {
    source: INGESTION_SOURCES.municipalitySignals.key,
    sourceConfidence: INGESTION_SOURCES.municipalitySignals.confidence,
    matched,
    signals: matched ? ['municipality_mapping_verified'] : ['municipality_mapping_unavailable'],
  };
}
