export type ConnectorSourceStatus =
  | 'ACTIVE'
  | 'METADATA_ONLY'
  | 'OPEN_DATA'
  | 'BLOCKED'
  | 'NOT_CONFIGURED';

export type ConnectorServiceType = 'WMS' | 'WFS' | 'WMTS' | 'GET_CAPABILITIES' | 'OPEN_DATASET' | 'METADATA_ONLY';

export type ConnectorSyncSafety = 'SAFE_PUBLIC_METADATA' | 'BLOCKED_NO_AUTOMATION';

export type ConnectorSourceRegistryEntry = {
  connectorKey: string;
  sourceName: string;
  officialUrl: string;
  status: ConnectorSourceStatus;
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
    status: 'METADATA_ONLY',
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
    status: 'METADATA_ONLY',
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
    status: 'BLOCKED',
    legalClassification: 'NO_SCRAPING_NO_EDEVLET_BYPASS',
    services: ['METADATA_ONLY'],
    syncSafety: 'BLOCKED_NO_AUTOMATION',
    manualActionRequired: true,
    blockedReason: 'No scraping, no e-Devlet bypass, no automated parcel harvesting.',
    cronEligible: false,
  },
];

export function findConnectorSourceRegistry(connectorKey: string) {
  return CONNECTOR_SOURCE_REGISTRY.find((entry) => entry.connectorKey === connectorKey);
}
