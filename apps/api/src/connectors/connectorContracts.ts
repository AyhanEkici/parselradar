export type ConnectorKey =
  | 'tucbs_ogc'
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
  category: 'cadastre' | 'zoning' | 'market' | 'infrastructure' | 'demographic' | 'mapping' | 'communications' | 'geo_layers';
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

// V19: Structured test outcome returned by each connector's test() method
export type ConnectorTestOutcome = {
  state: ConnectorState;
  message: string;
  samplePayloadSchema?: Record<string, unknown>;
  checkedAt: string;
};

// V19: Result of a sample payload validation
export type ConnectorSampleValidationResult = {
  valid: boolean;
  errors: string[];
};

// V19: Full execution contract that each connector module must implement
export type ConnectorExecutionContract = {
  key: ConnectorKey;
  requiredEnv: string[];
  legalRequirement: string;
  status(): ConnectorState;
  test(): Promise<ConnectorTestOutcome>;
  validateSample(sample: unknown): ConnectorSampleValidationResult;
  normalizeSample(sample: unknown): Record<string, unknown>;
};
