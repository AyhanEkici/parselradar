import { PARCEL_MERGE_RULES } from '../../config/development/parcelMergeRules';

export type ParcelMergeOpportunityResult = {
  score: number;
  level: 'limited' | 'assembly' | 'expansion';
  signals: string[];
};

function zoningKey(zoningStatus?: string) {
  const value = (zoningStatus || '').toLowerCase();
  if (value.includes('sanayi') || value.includes('industrial')) return 'industrial';
  if (value.includes('ticari') || value.includes('commercial') || value.includes('karma') || value.includes('mixed')) return 'mixed';
  if (value.includes('turizm') || value.includes('tourism')) return 'tourism';
  return 'residential';
}

export function detectParcelMergeOpportunity(input: {
  areaM2?: number;
  district?: string;
  zoningStatus?: string;
}): ParcelMergeOpportunityResult {
  const area = input.areaM2 || 0;
  const district = (input.district || '').toLowerCase();
  const signals: string[] = [];
  let score = 28;

  if (area >= PARCEL_MERGE_RULES.minimumAssemblyAreaM2) {
    score += 24;
    signals.push('assembly_scale_possible');
  }
  if (area >= PARCEL_MERGE_RULES.expansionAreaThresholdM2) {
    score += 18;
    signals.push('expansion_scale_possible');
  }

  score += PARCEL_MERGE_RULES.districtAggregationBonuses[district as keyof typeof PARCEL_MERGE_RULES.districtAggregationBonuses] || 0;
  score += PARCEL_MERGE_RULES.zoningBonuses[zoningKey(input.zoningStatus) as keyof typeof PARCEL_MERGE_RULES.zoningBonuses];

  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const level = bounded >= 78 ? 'expansion' : bounded >= 56 ? 'assembly' : 'limited';

  return {
    score: bounded,
    level,
    signals,
  };
}
