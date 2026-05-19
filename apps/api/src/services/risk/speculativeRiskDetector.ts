export function detectSpeculativeRisk(input: {
  recommendations?: string[];
  trendSignals?: string[];
  staleFlags?: string[];
}): { speculativeSignals: string[]; score: number } {
  const signals: string[] = [];
  const recommendations = input.recommendations || [];
  const trendSignals = input.trendSignals || [];

  if (recommendations.some((r) => /rezoning|permit|upside|high\s+return/i.test(r))) {
    signals.push('Forward-looking recommendation requires caution.');
  }
  if (trendSignals.some((s) => /speculative|volatility|degraded/i.test(s))) {
    signals.push('Speculative trend signal detected.');
  }
  if ((input.staleFlags || []).length > 0) {
    signals.push('Stale data may amplify speculation risk.');
  }

  return {
    speculativeSignals: signals,
    score: Math.max(0, Math.min(100, signals.length * 22 + (input.staleFlags?.length || 0) * 10)),
  };
}
