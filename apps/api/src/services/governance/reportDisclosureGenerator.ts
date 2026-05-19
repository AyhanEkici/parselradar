import { DisclosureMode, GovernanceClassification } from './governanceTypes';

export function generateReportDisclosure(input: {
  governance: GovernanceClassification;
  prohibitedClaims: number;
  missingInputs: string[];
}): { mode: DisclosureMode; lines: string[] } {
  const lines: string[] = [
    'This output is informational and does not constitute investment advice.',
    'No guarantee is made for appreciation, rezoning, permit approval, or ROI outcomes.',
    'Planning outcomes remain subject to municipal and regulatory decisions.',
    'Market conditions can change and may invalidate assumptions over time.',
  ];

  if (input.missingInputs.length > 0) {
    lines.push(`Missing data affected confidence: ${input.missingInputs.slice(0, 6).join(', ')}.`);
  }

  if (input.prohibitedClaims > 0) {
    lines.push('Certain wording was flagged as speculative and should not be client-facing without revision.');
  }

  const mode: DisclosureMode =
    input.governance === 'SPECULATIVE' || input.governance === 'INSUFFICIENT_DATA'
      ? 'HIGH_RISK_DISCLOSURE'
      : input.governance === 'CAUTION'
      ? 'CLIENT_VISIBLE'
      : 'CLIENT_VISIBLE';

  return { mode, lines };
}
