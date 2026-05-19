export type ComplianceClassification = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'BLOCK_CLIENT_DELIVERY';

export function classifyCompliance(input: {
  unsupportedClaimCount: number;
  governance: 'SAFE' | 'CAUTION' | 'SPECULATIVE' | 'INSUFFICIENT_DATA';
}): ComplianceClassification {
  if (input.unsupportedClaimCount > 0 || input.governance === 'SPECULATIVE') {
    return 'BLOCK_CLIENT_DELIVERY';
  }
  if (input.governance === 'CAUTION' || input.governance === 'INSUFFICIENT_DATA') {
    return 'REVIEW_REQUIRED';
  }
  return 'COMPLIANT';
}
