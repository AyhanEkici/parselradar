import { SourceReliability } from '../governance/governanceTypes';

export function classifySourceReliability(input: {
  sourceConfidence?: string;
  sourceKey: string;
}): SourceReliability {
  const key = input.sourceKey.toLowerCase();
  const confidence = String(input.sourceConfidence || '').toLowerCase();

  if (key.includes('municipality') || key.includes('tkgm') || key.includes('official')) {
    return 'VERIFIED_OFFICIAL';
  }
  if (confidence === 'verified') return 'VERIFIED_PUBLIC';
  if (confidence === 'medium') return 'PARTIAL';
  if (confidence === 'low') return 'UNVERIFIED';
  return 'UNKNOWN';
}
