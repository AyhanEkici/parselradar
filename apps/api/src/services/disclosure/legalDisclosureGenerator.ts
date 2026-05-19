export function generateLegalDisclosures(input: {
  missingInputs?: string[];
  speculativeSignals?: string[];
  unsupportedClaimCount?: number;
}) {
  const lines = [
    'This analysis is informational and not investment advice.',
    'No guarantee is provided for ROI, appreciation, rezoning, permit, or financing outcomes.',
    'Planning and entitlement decisions remain subject to authority review.',
    'Market conditions may change and can invalidate assumptions over time.',
    'Users should verify title, zoning, permit, and encumbrance records through official channels.',
  ];

  if ((input.missingInputs || []).length > 0) {
    lines.push(`Missing data can materially change outputs: ${(input.missingInputs || []).slice(0, 6).join(', ')}.`);
  }
  if ((input.speculativeSignals || []).length > 0) {
    lines.push('Speculative indicators were detected and confidence was penalized accordingly.');
  }
  if ((input.unsupportedClaimCount || 0) > 0) {
    lines.push('Certain wording was flagged as unsupported and should be revised before client delivery.');
  }

  return lines;
}
