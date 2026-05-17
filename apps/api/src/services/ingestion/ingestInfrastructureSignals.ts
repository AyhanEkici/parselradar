import { INGESTION_SOURCES } from '../../config/ingestion/ingestionSources';
import { AIRPORT_NODES } from '../../config/maps/airportNodes';
import { INDUSTRIAL_ZONES } from '../../config/maps/industrialZones';
import { ROAD_CORRIDORS } from '../../config/maps/roadCorridors';
import { TOURISM_ZONES } from '../../config/maps/tourismZones';

export function ingestInfrastructureSignals(input: { city?: string }) {
  const city = (input.city || '').toLowerCase();
  const airportCount = AIRPORT_NODES.filter((item) => item.city === city).length;
  const industrialCount = INDUSTRIAL_ZONES.filter((item) => item.city === city).length;
  const corridorCount = ROAD_CORRIDORS.filter((item) => item.city === city).length;
  const tourismCount = TOURISM_ZONES.filter((item) => item.city === city).length;

  return {
    source: INGESTION_SOURCES.infrastructureSignals.key,
    sourceConfidence: INGESTION_SOURCES.infrastructureSignals.confidence,
    airportCount,
    industrialCount,
    corridorCount,
    tourismCount,
    signals: [
      airportCount > 0 ? 'airport_dataset_available' : 'airport_dataset_sparse',
      industrialCount > 0 ? 'industrial_dataset_available' : 'industrial_dataset_sparse',
      corridorCount > 0 ? 'road_dataset_available' : 'road_dataset_sparse',
      tourismCount > 0 ? 'tourism_dataset_available' : 'tourism_dataset_sparse',
    ],
  };
}
