export function calculateMissingDataImpact(input: {
  missingInputs?: string[];
  staleFlags?: string[];
  hasPlanningData?: boolean;
  weakComparables?: boolean;
}): { score: number; drivers: string[] } {
  const missing = input.missingInputs || [];
  const stale = input.staleFlags || [];
  const drivers: string[] = [];

  let score = Math.min(65, missing.length * 8 + stale.length * 9);

  if (!input.hasPlanningData) {
    score += 14;
    drivers.push('No planning data');
  }
  if (input.weakComparables) {
    score += 10;
    drivers.push('Weak comparables');
  }

  if (missing.length) drivers.push(`Missing inputs: ${missing.slice(0, 6).join(', ')}`);
  if (stale.length) drivers.push(`Stale signals: ${stale.slice(0, 6).join(', ')}`);

  return { score: Math.max(0, Math.min(100, score)), drivers };
}
