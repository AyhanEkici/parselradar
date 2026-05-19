const PROHIBITED_PATTERNS = [
  /\bguaranteed\b/i,
  /\bcertain\b/i,
  /\brisk[-\s]?free\b/i,
  /\bwill\s+appreciate\b/i,
  /\bdefinitely\s+rezoning\b/i,
  /\bimpossible\s+to\s+lose\b/i,
  /\bassured\s+investment\b/i,
  /\bguaranteed\s+roi\b/i,
  /\bguaranteed\s+permit\b/i,
];

export function guardInvestmentLanguage(input: string): { blocked: boolean; matches: string[] } {
  const text = String(input || '');
  const matches = PROHIBITED_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.toString());
  return { blocked: matches.length > 0, matches };
}

export function getProhibitedClaimHints() {
  return [
    'Use probability bands instead of certainty.',
    'State planning and market outcomes as conditional.',
    'Disclose data limitations before recommendations.',
  ];
}
