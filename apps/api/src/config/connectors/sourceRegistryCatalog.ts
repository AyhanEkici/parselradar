export type ConnectorSourceStatus =
  | 'ACTIVE'
  | 'METADATA_ONLY'
  | 'OPEN_DATA'
  | 'BLOCKED'
  | 'NOT_CONFIGURED'
  | 'VERIFIED_PUBLIC_EIMAR'
  | 'VERIFIED_PUBLIC_MAP'
  | 'VERIFIED_PUBLIC_IMAR_INFO_PAGE'
  | 'BLOCKED_BY_LOGIN';

export type ConnectorServiceType = 'WMS' | 'WFS' | 'WMTS' | 'GET_CAPABILITIES' | 'OPEN_DATASET' | 'METADATA_ONLY';

export type ConnectorSyncSafety = 'SAFE_PUBLIC_METADATA' | 'BLOCKED_NO_AUTOMATION';

export type ConnectorLegalMode = 'PUBLIC_METADATA_SYNC' | 'MANUAL_GUIDANCE' | 'BLOCKED';

export type ConnectorAccessStatus =
  | 'PUBLIC_ACCESS'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'BLOCKED_BY_LOGIN'
  | 'BLOCKED_BY_CAPTCHA'
  | 'BLOCKED_BY_EDEVLET';

export type ConnectorActivationState = 'ACTIVE' | 'INACTIVE' | 'GUIDANCE_ONLY' | 'BLOCKED';

export type ConnectorSourceType =
  | 'NATIONAL_METADATA'
  | 'MUNICIPALITY_E_IMAR'
  | 'MUNICIPALITY_E_PLAN'
  | 'OFFICIAL_MUNICIPALITY_MAP'
  | 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY';

export type ConnectorSourceRegistryEntry = {
  connectorKey: string;
  sourceName: string;
  officialUrl: string;
  provider: string;
  municipality?: string;
  province?: string;
  district?: string;
  sourceType: ConnectorSourceType;
  status: ConnectorSourceStatus;
  legalMode: ConnectorLegalMode;
  accessStatus: ConnectorAccessStatus;
  activationState: ConnectorActivationState;
  legalClassification: string;
  services: ConnectorServiceType[];
  syncSafety: ConnectorSyncSafety;
  manualActionRequired: boolean;
  blockedReason?: string;
  cronEligible: boolean;
  cronCadenceMinutes?: number;
};

export const CONNECTOR_SOURCE_REGISTRY: ConnectorSourceRegistryEntry[] = [
  {
    connectorKey: 'tucbs_ogc',
    sourceName: 'TUCBS Public OGC Services',
    officialUrl: 'https://tucbs-public.example.invalid/getcapabilities',
    provider: 'TUCBS',
    sourceType: 'NATIONAL_METADATA',
    status: 'METADATA_ONLY',
    legalMode: 'PUBLIC_METADATA_SYNC',
    accessStatus: 'PUBLIC_ACCESS',
    activationState: 'ACTIVE',
    legalClassification: 'PUBLIC_METADATA_ONLY',
    services: ['GET_CAPABILITIES', 'WMS', 'WFS', 'WMTS'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: false,
    cronEligible: true,
    cronCadenceMinutes: 360,
  },
  {
    connectorKey: 'municipality_zoning',
    sourceName: 'Municipality Public Guidance Sources',
    officialUrl: 'https://www.turkiye.gov.tr/',
    provider: 'Municipality Guidance Registry',
    sourceType: 'OFFICIAL_MUNICIPALITY_ZONING_INQUIRY',
    status: 'METADATA_ONLY',
    legalMode: 'MANUAL_GUIDANCE',
    accessStatus: 'MANUAL_REVIEW_REQUIRED',
    activationState: 'GUIDANCE_ONLY',
    legalClassification: 'GUIDANCE_ONLY_MANUAL_EVIDENCE_REQUIRED',
    services: ['METADATA_ONLY', 'OPEN_DATASET'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: true,
    cronEligible: false,
  },
  {
    connectorKey: 'tkgm_parcel',
    sourceName: 'TKGM Parcel Systems',
    officialUrl: 'https://parselsorgu.tkgm.gov.tr/',
    provider: 'TKGM',
    sourceType: 'NATIONAL_METADATA',
    status: 'BLOCKED',
    legalMode: 'BLOCKED',
    accessStatus: 'BLOCKED_BY_EDEVLET',
    activationState: 'BLOCKED',
    legalClassification: 'NO_SCRAPING_NO_EDEVLET_BYPASS',
    services: ['METADATA_ONLY'],
    syncSafety: 'BLOCKED_NO_AUTOMATION',
    manualActionRequired: true,
    blockedReason: 'No scraping, no e-Devlet bypass, no automated parcel harvesting.',
    cronEligible: false,
  },
  {
    connectorKey: 'kayseri_kent_rehberi',
    sourceName: 'Kayseri Buyuksehir Kent Rehberi',
    officialUrl: 'https://cbs.kayseri.bel.tr/Kayseri-Kent-Rehberi',
    provider: 'Kayseri Buyuksehir Belediyesi',
    municipality: 'Kayseri Buyuksehir Belediyesi',
    province: 'Kayseri',
    district: 'Kayseri',
    sourceType: 'OFFICIAL_MUNICIPALITY_MAP',
    status: 'VERIFIED_PUBLIC_MAP',
    legalMode: 'MANUAL_GUIDANCE',
    accessStatus: 'MANUAL_REVIEW_REQUIRED',
    activationState: 'GUIDANCE_ONLY',
    legalClassification: 'GUIDANCE_ONLY_MANUAL_EVIDENCE_REQUIRED',
    services: ['METADATA_ONLY'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: true,
    cronEligible: false,
  },
  {
    connectorKey: 'kocasinan_eimar',
    sourceName: 'Kocasinan Belediyesi e-Imar',
    officialUrl: 'https://cbs.kocasinan.bel.tr/user/',
    provider: 'Kocasinan Belediyesi',
    municipality: 'Kocasinan Belediyesi',
    province: 'Kayseri',
    district: 'Kocasinan',
    sourceType: 'MUNICIPALITY_E_IMAR',
    status: 'VERIFIED_PUBLIC_EIMAR',
    legalMode: 'MANUAL_GUIDANCE',
    accessStatus: 'MANUAL_REVIEW_REQUIRED',
    activationState: 'GUIDANCE_ONLY',
    legalClassification: 'GUIDANCE_ONLY_MANUAL_EVIDENCE_REQUIRED',
    services: ['METADATA_ONLY'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: true,
    cronEligible: false,
  },
  {
    connectorKey: 'melikgazi_cbs_map',
    sourceName: 'Melikgazi CBS Map',
    officialUrl: 'https://cbs.melikgazi.bel.tr/portal/apps/webappviewer/index.html?id=9999a7e224d24b0d96b93911530cb4d3',
    provider: 'Melikgazi Belediyesi',
    municipality: 'Melikgazi Belediyesi',
    province: 'Kayseri',
    district: 'Melikgazi',
    sourceType: 'OFFICIAL_MUNICIPALITY_MAP',
    status: 'VERIFIED_PUBLIC_MAP',
    legalMode: 'MANUAL_GUIDANCE',
    accessStatus: 'MANUAL_REVIEW_REQUIRED',
    activationState: 'GUIDANCE_ONLY',
    legalClassification: 'GUIDANCE_ONLY_MANUAL_EVIDENCE_REQUIRED',
    services: ['METADATA_ONLY'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: true,
    cronEligible: false,
  },
  {
    connectorKey: 'talas_imar_planlari',
    sourceName: 'Talas Uygulama Imar Planlari',
    officialUrl: 'https://www.talas.bel.tr/uygulama-imar-planlari',
    provider: 'Talas Belediyesi',
    municipality: 'Talas Belediyesi',
    province: 'Kayseri',
    district: 'Talas',
    sourceType: 'MUNICIPALITY_E_PLAN',
    status: 'VERIFIED_PUBLIC_IMAR_INFO_PAGE',
    legalMode: 'MANUAL_GUIDANCE',
    accessStatus: 'MANUAL_REVIEW_REQUIRED',
    activationState: 'GUIDANCE_ONLY',
    legalClassification: 'GUIDANCE_ONLY_MANUAL_EVIDENCE_REQUIRED',
    services: ['METADATA_ONLY'],
    syncSafety: 'SAFE_PUBLIC_METADATA',
    manualActionRequired: true,
    cronEligible: false,
  },
  {
    connectorKey: 'melikgazi_dimar_blocked',
    sourceName: 'Melikgazi D-Imar',
    officialUrl: 'https://imar.melikgazi.bel.tr/YapiBelgeleriWeb/Kullanici',
    provider: 'Melikgazi Belediyesi',
    municipality: 'Melikgazi Belediyesi',
    province: 'Kayseri',
    district: 'Melikgazi',
    sourceType: 'MUNICIPALITY_E_IMAR',
    status: 'BLOCKED_BY_LOGIN',
    legalMode: 'BLOCKED',
    accessStatus: 'BLOCKED_BY_LOGIN',
    activationState: 'BLOCKED',
    legalClassification: 'BLOCKED_LOGIN_CAPTCHA_EDEVLET_MANUAL_ONLY',
    services: ['METADATA_ONLY'],
    syncSafety: 'BLOCKED_NO_AUTOMATION',
    manualActionRequired: true,
    blockedReason: 'Blocked source: login/CAPTCHA/e-Devlet required',
    cronEligible: false,
  },
];

export function findConnectorSourceRegistry(connectorKey: string) {
  return CONNECTOR_SOURCE_REGISTRY.find((entry) => entry.connectorKey === connectorKey);
}
