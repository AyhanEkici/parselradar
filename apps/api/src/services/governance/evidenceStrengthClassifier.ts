import { EvidenceStrength, ProvenanceSource } from './governanceTypes';

function weightForReliability(reliability: ProvenanceSource['reliability']) {
  switch (reliability) {
    case 'VERIFIED_OFFICIAL':
      return 1;
    case 'VERIFIED_PUBLIC':
      return 0.85;
    case 'PARTIAL':
      return 0.65;
    case 'UNVERIFIED':
      return 0.35;
    default:
      return 0.2;
  }
}

export function classifyEvidenceStrength(sources: ProvenanceSource[]): EvidenceStrength {
  if (!sources.length) return 'VERY_WEAK';

  const available = sources.filter((s) => s.available);
  if (!available.length) return 'VERY_WEAK';

  const verificationBonus = available.filter((s) => s.state === 'verified').length * 0.04;
  const freshnessPenalty = available.filter((s) => s.freshnessDays > 180).length * 0.06;

  const weighted =
    available.reduce((sum, source) => sum + weightForReliability(source.reliability), 0) / available.length + verificationBonus - freshnessPenalty;

  if (weighted >= 0.93) return 'VERIFIED';
  if (weighted >= 0.78) return 'STRONG';
  if (weighted >= 0.58) return 'MODERATE';
  if (weighted >= 0.36) return 'WEAK';
  return 'VERY_WEAK';
}
