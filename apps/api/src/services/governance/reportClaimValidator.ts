import { guardInvestmentLanguage } from './investmentLanguageGuard';

export interface ClaimValidationResult {
  safe: boolean;
  violations: string[];
}

export function validateReportClaims(lines: string[]): ClaimValidationResult {
  const violations: string[] = [];

  for (const line of lines) {
    const check = guardInvestmentLanguage(line);
    if (check.blocked) {
      violations.push(`Prohibited certainty wording detected: ${line.slice(0, 120)}`);
    }
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}
