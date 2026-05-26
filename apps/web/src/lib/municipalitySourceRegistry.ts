export type MunicipalitySourceStatus =
  | 'VERIFIED_OFFICIAL_SOURCE'
  | 'NEEDS_MANUAL_REVIEW'
  | 'NOT_CONFIGURED'
  | 'DEPRECATED';

export type MunicipalityPublicSourceStatus =
  | 'VERIFIED_PUBLIC_EIMAR'
  | 'VERIFIED_PUBLIC_MAP'
  | 'VERIFIED_PUBLIC_IMAR_INFO_PAGE'
  | 'BLOCKED_BY_LOGIN'
  | 'BLOCKED_BY_CAPTCHA'
  | 'BROKEN_OR_UNREACHABLE'
  | 'NOT_FOUND'
  | 'NOT_CONFIGURED';

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
  publicSourceStatus?: MunicipalityPublicSourceStatus;
  lastCheckedAt: string;
  notes: string;
};

export type MunicipalitySourceLookup = {
  status: MunicipalitySourceStatus;
  source?: MunicipalitySourceEntry;
  guidance: string;
};

export type MunicipalityBlockedSource = {
  province: string;
  district: string;
  sourceLabel: string;
  url: string;
  status: Extract<MunicipalityPublicSourceStatus, 'BLOCKED_BY_LOGIN' | 'BLOCKED_BY_CAPTCHA'>;
  reason: string;
};

const municipalitySourceRegistry: MunicipalitySourceEntry[] = [
  {
    province: 'KAYSERI',
    district: 'KAYSERI',
    sourceLabel: 'Kayseri Buyuksehir Belediyesi Kent Bilgi Sistemi / Kent Rehberi',
    sourceType: 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY',
    url: 'https://cbs.kayseri.bel.tr/Kayseri-Kent-Rehberi',
    status: 'VERIFIED_OFFICIAL_SOURCE',
    publicSourceStatus: 'VERIFIED_PUBLIC_MAP',
    lastCheckedAt: '2026-05-23',
    notes: 'Public CBS and kent rehberi page manually verified. Guidance-only source to check; not automated zoning verification or property-level proof.',
  },
  {
    province: 'KAYSERI',
    district: 'KOCASINAN',
    sourceLabel: 'Kocasinan Belediyesi E-Imar',
    sourceType: 'MUNICIPALITY_E_IMAR',
    url: 'https://cbs.kocasinan.bel.tr/user/',
    status: 'VERIFIED_OFFICIAL_SOURCE',
    publicSourceStatus: 'VERIFIED_PUBLIC_EIMAR',
    lastCheckedAt: '2026-05-23',
    notes: 'Public e-imar query page manually verified. Page states results are informational only and have no legal validity.',
  },
  {
    province: 'KAYSERI',
    district: 'MELIKGAZI',
    sourceLabel: 'Melikgazi Belediyesi CBS',
    sourceType: 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY',
    url: 'https://cbs.melikgazi.bel.tr/portal/apps/webappviewer/index.html?id=9999a7e224d24b0d96b93911530cb4d3',
    status: 'VERIFIED_OFFICIAL_SOURCE',
    publicSourceStatus: 'VERIFIED_PUBLIC_MAP',
    lastCheckedAt: '2026-05-23',
    notes: 'Public CBS map manually verified. Separate D-Imar page exists but is blocked by login and CAPTCHA, so no automated or authenticated source use is allowed.',
  },
  {
    province: 'KAYSERI',
    district: 'TALAS',
    sourceLabel: 'Talas Belediyesi Uygulama Imar Planlari',
    sourceType: 'MUNICIPALITY_E_PLAN',
    url: 'https://www.talas.bel.tr/uygulama-imar-planlari',
    status: 'VERIFIED_OFFICIAL_SOURCE',
    publicSourceStatus: 'VERIFIED_PUBLIC_IMAR_INFO_PAGE',
    lastCheckedAt: '2026-05-23',
    notes: 'Public imar plan listing page manually verified on the official municipality website. Guidance-only source to check; not automated zoning verification.',
  },

  // P2_1C_TRIAGED_BACKLOG entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'ISTANBUL',
    district: 'KADIKOY',
    sourceLabel: 'Municipality e-Imar/e-Plan source pending manual verification',
    sourceType: 'MUNICIPALITY_E_IMAR',
    url: '',
    status: 'NOT_CONFIGURED',
    publicSourceStatus: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
  // P2_1C_TRIAGED_BACKLOG entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'ANKARA',
    district: 'CANKAYA',
    sourceLabel: 'Municipality zoning inquiry source pending manual verification',
    sourceType: 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY',
    url: '',
    status: 'NOT_CONFIGURED',
    publicSourceStatus: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
  // P2_1C_TRIAGED_BACKLOG entry only. Keep as NOT_CONFIGURED until manually verified.
  {
    province: 'IZMIR',
    district: 'KONAK',
    sourceLabel: 'Imar durumu service source pending manual verification',
    sourceType: 'IMAR_DURUMU_SERVICE',
    url: '',
    status: 'NOT_CONFIGURED',
    publicSourceStatus: 'NOT_CONFIGURED',
    lastCheckedAt: '',
    notes: 'No verified URL recorded yet. Use manual guidance only.',
  },
];

const blockedMunicipalitySources: MunicipalityBlockedSource[] = [
  {
    province: 'KAYSERI',
    district: 'MELIKGAZI',
    sourceLabel: 'Melikgazi D-Imar',
    url: 'https://imar.melikgazi.bel.tr/YapiBelgeleriWeb/Kullanici',
    status: 'BLOCKED_BY_LOGIN',
    reason: 'Source exists but requires login/CAPTCHA/e-Devlet/manual access.',
  },
];

function normalizeKey(value?: string) {
  return String(value || '').trim().toLocaleUpperCase('tr-TR');
}

export function getMunicipalitySource(province?: string, district?: string): MunicipalitySourceLookup {
  const provinceKey = normalizeKey(province);
  const districtKey = normalizeKey(district);

  if (!provinceKey) {
    return {
      status: 'NOT_CONFIGURED',
      guidance: 'Exact municipality source URL is not configured yet.',
    };
  }

  const exact = districtKey
    ? municipalitySourceRegistry.find(
        (entry) => normalizeKey(entry.province) === provinceKey && normalizeKey(entry.district) === districtKey
      )
    : undefined;
  const provinceFallback = municipalitySourceRegistry.find(
    (entry) => normalizeKey(entry.province) === provinceKey && normalizeKey(entry.district) === provinceKey
  );
  const selected = exact || provinceFallback;

  if (selected && selected.status === 'VERIFIED_OFFICIAL_SOURCE' && selected.url.trim()) {
    return {
      status: 'VERIFIED_OFFICIAL_SOURCE',
      source: selected,
      guidance: 'Verified municipality source is available.',
    };
  }

  return {
    status: selected?.status || 'NOT_CONFIGURED',
    guidance: 'Exact municipality source URL is not configured yet.',
  };
}

export function getMunicipalityBlockedSource(province?: string, district?: string): MunicipalityBlockedSource | undefined {
  const provinceKey = normalizeKey(province);
  const districtKey = normalizeKey(district);

  if (!provinceKey || !districtKey) return undefined;

  return blockedMunicipalitySources.find(
    (entry) => normalizeKey(entry.province) === provinceKey && normalizeKey(entry.district) === districtKey
  );
}

export function getMunicipalityPublicSourceStatus(source?: MunicipalitySourceEntry): MunicipalityPublicSourceStatus {
  if (!source) return 'NOT_CONFIGURED';
  return source.publicSourceStatus || 'NOT_CONFIGURED';
}
