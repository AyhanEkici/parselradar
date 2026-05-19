import { InfrastructurePressure, IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function infrastructurePressureEngine(input: { infrastructureScore?: number; nearbyInfrastructureCount?: number; logisticsCorridorScore?: number }): IntelligenceSignal<InfrastructurePressure> {
  const infra = Number(input.infrastructureScore || 0);
  const nearby = Number(input.nearbyInfrastructureCount || 0);
  const logistics = Number(input.logisticsCorridorScore || 0);
  const score = Math.max(0, Math.min(100, Math.round(infra * 0.55 + Math.min(20, nearby * 3) + logistics * 0.25)));
  const value: InfrastructurePressure =
    score >= 85 ? 'STRATEGIC' : score >= 68 ? 'STRONG' : score >= 48 ? 'MODERATE' : score >= 25 ? 'LOW' : 'NONE';
  return {
    value,
    source: 'infrastructure score + proximity + logistics corridor score',
    freshnessDays: 26,
    confidence: 66,
    inferenceLevel: 'inferred',
    notes: ['Pressure indicates development relevance, not guaranteed infrastructure execution.'],
  };
}
