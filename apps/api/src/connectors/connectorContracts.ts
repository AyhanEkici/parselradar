export type ConnectorKey =
  | 'tkgm_parcel'
  | 'municipality_zoning'
  | 'listing_feed'
  | 'infrastructure_feed'
  | 'demographic_feed'
  | 'map_geocoding'
  | 'email_provider';

export type ConnectorState =
  | 'NOT_CONFIGURED'
  | 'CREDENTIALS_MISSING'
  | 'LEGAL_REVIEW_REQUIRED'
  | 'READY_FOR_TEST'
  | 'TEST_FAILED'
  | 'TEST_PASSED'
  | 'ACTIVE'
  | 'DISABLED';

export type ConnectorDefinition = {
  key: ConnectorKey;
  name: string;
  description: string;
  category: 'cadastre' | 'zoning' | 'market' | 'infrastructure' | 'demographic' | 'mapping' | 'communications';
  credentialEnvKeys: string[];
  endpointEnvKey?: string;
  legalRequirementKey: string;
  activeEnvKey?: string;
};

export type ConnectorTestResult = {
  connectorKey: ConnectorKey;
  state: ConnectorState;
  message: string;
  checkedAt: string;
  details?: Record<string, unknown>;
};
