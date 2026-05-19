export function ingestionComplianceSummary(input: {
  legalStates: string[];
  connectorStates: string[];
  termsAccepted: boolean[];
}) {
  const allTermsAccepted = input.termsAccepted.every(Boolean);
  const hasLegalReview = input.connectorStates.includes('LEGAL_REVIEW');
  const restricted = input.legalStates.filter((x) => x !== 'ALLOW').length;

  return {
    complianceState: !allTermsAccepted || hasLegalReview ? 'BLOCKED' : restricted > 0 ? 'PARTIAL' : 'PASS',
    allTermsAccepted,
    restrictedSourceCount: restricted,
    legalReviewRequired: hasLegalReview,
  } as const;
}
