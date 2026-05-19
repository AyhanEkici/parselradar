export type EvidenceStrength = 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERIFIED';
export type ConfidenceClass = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type GovernanceClassification = 'SAFE' | 'CAUTION' | 'SPECULATIVE' | 'INSUFFICIENT_DATA';
export type SourceReliability = 'UNKNOWN' | 'UNVERIFIED' | 'PARTIAL' | 'VERIFIED_PUBLIC' | 'VERIFIED_OFFICIAL';
export type DisclosureMode = 'INTERNAL_ONLY' | 'CLIENT_VISIBLE' | 'HIGH_RISK_DISCLOSURE';
export type VerificationState = 'verified' | 'inferred' | 'estimated' | 'unavailable';

export interface ProvenanceSource {
  key: string;
  label: string;
  reliability: SourceReliability;
  state: VerificationState;
  freshnessDays: number;
  available: boolean;
  note?: string;
}

export interface GovernanceContext {
  score?: number;
  confidence?: number;
  summary?: string;
  recommendations?: string[];
  risks?: string[];
  missingInputs?: string[];
  staleFlags?: string[];
  sourceConfidence?: string;
  freshnessScore?: number;
  trendSignals?: string[];
  opportunitySignals?: string[];
  analysisVersion?: string;
  reportText?: string;
}
