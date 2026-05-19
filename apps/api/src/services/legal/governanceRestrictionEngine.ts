export function governanceRestrictionEngine(input: {
  activationState: string;
  legalState: string;
  termsAccepted: boolean;
}) {
  const blockedByActivation = ['DISABLED', 'FAILED', 'LEGAL_REVIEW'].includes(input.activationState);
  const blockedByLegal = input.legalState !== 'ALLOW';
  const blockedByTerms = !input.termsAccepted;
  const blocked = blockedByActivation || blockedByLegal || blockedByTerms;

  return {
    blocked,
    blockedBy: {
      activation: blockedByActivation,
      legal: blockedByLegal,
      terms: blockedByTerms,
    },
    restrictionReason: blocked
      ? blockedByActivation
        ? `activation_state_${input.activationState.toLowerCase()}`
        : blockedByLegal
          ? `legal_state_${input.legalState.toLowerCase()}`
          : 'terms_not_accepted'
      : 'none',
  };
}
