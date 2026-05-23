export type MunicipalitySourceStatus =
  | 'VERIFIED_OFFICIAL_SOURCE'
  | 'NEEDS_MANUAL_REVIEW'
  | 'NOT_CONFIGURED'
  | 'DEPRECATED';

export type MunicipalitySourceType =
  | 'MUNICIPALITY_E_IMAR'
  | 'MUNICIPALITY_E_PLAN'
  | 'IMAR_DURUMU_SERVICE'
  | 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY';

export type MunicipalitySourceEntry = {
  province: string;
  district: string;
  sourceLabel: string;
  sourceType: MunicipalitySourceType;
  url: string;
  status: MunicipalitySourceStatus;
  lastCheckedAt: string;
  notes: string;
};

export type MunicipalitySourceLookup = {
  status: MunicipalitySourceStatus;
  source?: MunicipalitySourceEntry;
  guidance: string;
};

const municipalitySourceRegistry: MunicipalitySourceEntry[] = [
  // Placeholder entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'ISTANBUL',
    district: 'KADIKOY',
    sourceLabel: 'Municipality e-Imar/e-Plan source pending manual verification',
    sourceType: 'MUNICIPALITY_E_IMAR',
    url: '',
    status: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
  // Placeholder entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'ANKARA',
    district: 'CANKAYA',
    sourceLabel: 'Municipality zoning inquiry source pending manual verification',
    sourceType: 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY',
    url: '',
    status: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
  // Placeholder entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'IZMIR',
    district: 'KONAK',
    sourceLabel: 'Imar durumu service source pending manual verification',
    sourceType: 'IMAR_DURUMU_SERVICE',
    url: '',
    status: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
];

function normalizeKey(value?: string) {
  return String(value || '').trim().toLocaleUpperCase('tr-TR');
}

export function getMunicipalitySource(province?: string, district?: string): MunicipalitySourceLookup {
  const provinceKey = normalizeKey(province);
  const districtKey = normalizeKey(district);

  if (!provinceKey || !districtKey) {
    return {
      status: 'NOT_CONFIGURED',
      guidance: 'Exact municipality source URL is not configured yet.',
    };
  }

  const exact = municipalitySourceRegistry.find(
    (entry) => normalizeKey(entry.province) === provinceKey && normalizeKey(entry.district) === districtKey
  );

  if (exact && exact.status === 'VERIFIED_OFFICIAL_SOURCE' && exact.url.trim()) {
    return {
      status: 'VERIFIED_OFFICIAL_SOURCE',
      source: exact,
      guidance: 'Verified municipality source is available.',
    };
  }

  return {
    status: exact?.status || 'NOT_CONFIGURED',
    guidance: 'Exact municipality source URL is not configured yet.',
  };
}
