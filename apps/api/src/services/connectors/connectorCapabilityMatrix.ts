export type ConnectorActivationState =
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'READY_FOR_TEST'
  | 'TESTING'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'DISABLED'
  | 'LEGAL_REVIEW'
  | 'FAILED';

export type SourceType =
  | 'cadastre'
  | 'zoning'
  | 'municipality'
  | 'infrastructure'
  | 'demographics'
  | 'mapping'
  | 'market'
  | 'transport'
  | 'investment'
  | 'environmental';

export type ConnectorKeyV26 =
  | 'tkgm_parcel_metadata'
  | 'municipality_planning_metadata'
  | 'public_zoning_references'
  | 'infrastructure_references'
  | 'demographic_references'
  | 'regional_development_references';

export type ConnectorCapability = {
  key: ConnectorKeyV26;
  sourceType: SourceType;
  title: string;
  description: string;
  requiresEndpoint: boolean;
  requiresToken: boolean;
  allowsCollection: 'metadata_only';
  legalClass: 'PUBLIC_REFERENCE_METADATA' | 'PUBLIC_AGGREGATE_REFERENCE' | 'PUBLIC_INFRA_REFERENCE';
};

export const CONNECTOR_CAPABILITY_MATRIX: Record<ConnectorKeyV26, ConnectorCapability> = {
  tkgm_parcel_metadata: {
    key: 'tkgm_parcel_metadata',
    sourceType: 'cadastre',
    title: 'TKGM Parcel Metadata',
    description: 'Public reference metadata for parcel identity and cadastral linkability.',
    requiresEndpoint: true,
    requiresToken: true,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_REFERENCE_METADATA',
  },
  municipality_planning_metadata: {
    key: 'municipality_planning_metadata',
    sourceType: 'municipality',
    title: 'Municipality Planning Metadata',
    description: 'Municipality planning metadata references for plan existence and revision timestamps.',
    requiresEndpoint: true,
    requiresToken: false,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_REFERENCE_METADATA',
  },
  public_zoning_references: {
    key: 'public_zoning_references',
    sourceType: 'zoning',
    title: 'Public Zoning Layer References',
    description: 'Layer-level zoning metadata references from publicly accessible registries.',
    requiresEndpoint: true,
    requiresToken: false,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_REFERENCE_METADATA',
  },
  infrastructure_references: {
    key: 'infrastructure_references',
    sourceType: 'infrastructure',
    title: 'Infrastructure References',
    description: 'Public infrastructure reference metadata for roads, utilities, and transport corridors.',
    requiresEndpoint: true,
    requiresToken: false,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_INFRA_REFERENCE',
  },
  demographic_references: {
    key: 'demographic_references',
    sourceType: 'demographics',
    title: 'Population and Demographic References',
    description: 'Aggregated demographic metadata references from public publications.',
    requiresEndpoint: true,
    requiresToken: false,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_AGGREGATE_REFERENCE',
  },
  regional_development_references: {
    key: 'regional_development_references',
    sourceType: 'investment',
    title: 'Regional Development References',
    description: 'Regional development plan and investment reference metadata.',
    requiresEndpoint: true,
    requiresToken: false,
    allowsCollection: 'metadata_only',
    legalClass: 'PUBLIC_AGGREGATE_REFERENCE',
  },
};
