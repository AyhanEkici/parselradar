const UNSUPPORTED_PATTERNS = [
  /\bguaranteed\b/i,
  /\bcertain\b/i,
  /\brisk[-\s]?free\b/i,
  /\bwill\s+appreciate\b/i,
  /\bdefinitely\s+rezoning\b/i,
  /\bimpossible\s+to\s+lose\b/i,
  /\bassured\s+investment\b/i,
];

export function detectUnsupportedClaims(lines: string[]): { count: number; flags: string[] } {
  const flags: string[] = [];

  for (const line of lines) {
    for (const pattern of UNSUPPORTED_PATTERNS) {
      if (pattern.test(line)) {
        flags.push(`Unsupported wording: ${line.slice(0, 120)}`);
        break;
      }
    }
  }

  return { count: flags.length, flags };
}
