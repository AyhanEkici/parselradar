export type InferenceLevel = 'verified' | 'inferred' | 'estimated' | 'unavailable';

export type IntelligenceSignal<T> = {
  value: T;
  source: string;
  freshnessDays: number;
  confidence: number;
  inferenceLevel: InferenceLevel;
  notes: string[];
};

export type PlanningClassification =
  | '1_100000_MACRO_SIGNAL'
  | '1_25000_REGIONAL_SIGNAL'
  | '1_5000_STRONG_SIGNAL'
  | '1_1000_OPERATIONAL_SIGNAL';

export type DevelopmentProbability = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type LiquidityClassification = 'ILLIQUID' | 'SLOW' | 'ACTIVE' | 'HIGH_ACTIVITY';
export type RegionalOutlook = 'DECLINING' | 'STABLE' | 'DEVELOPING' | 'ACCELERATING';
export type InfrastructurePressure = 'NONE' | 'LOW' | 'MODERATE' | 'STRONG' | 'STRATEGIC';
