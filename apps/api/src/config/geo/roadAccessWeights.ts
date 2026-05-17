export const ROAD_ACCESS_WEIGHTS = {
  highway_direct: { score: 92, label: 'Highway direct access' },
  highway_near: { score: 85, label: 'Highway near (<5km)' },
  anayol: { score: 78, label: 'Main road access' },
  arterial: { score: 72, label: 'Arterial road' },
  local_road: { score: 60, label: 'Local road' },
  village_road: { score: 40, label: 'Village road' },
  no_direct_access: { score: 25, label: 'No direct access' },
  unknown: { score: 55, label: 'Unknown' },
} as const;

export const ROAD_ACCESS_KEYWORDS = {
  highway: ['highway', 'otoyol', 'expressway', 'express'],
  anayol: ['anayol', 'main road', 'boulevard', 'bulvar'],
  arterial: ['arter', 'cadde', 'main street'],
  local: ['yol', 'road', 'sokak', 'street', 'local'],
  village: ['koy', 'village', 'kirsal', 'uzak'],
  none: ['no', 'none', 'yok', 'inaccessible'],
} as const;
