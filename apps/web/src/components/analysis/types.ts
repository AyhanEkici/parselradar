export type AnalysisSignal = 'STRONG' | 'MODERATE' | 'WEAK' | 'NEEDS_REVIEW' | string;

export type AnalysisPayload = {
  score: number;
  signal: AnalysisSignal;
  confidence?: number;
  strengths?: string[];
  risks?: string[];
  missingInputs?: string[];
  recommendation?: string;
  recommendations?: string[];
  factorsUsed?: Record<string, unknown>;
  valuationBand?: {
    low?: number;
    mid?: number;
    high?: number;
    currency?: string;
  };
  marketPosition?: string;
  developerFit?: string;
  zoningPotential?: string;
  liquiditySignal?: string;
};

export type PropertyContext = {
  areaM2?: number;
  zoningStatus?: string;
  roadAccess?: string;
  electricity?: string;
  water?: string;
};
