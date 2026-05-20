export function privilegedActionReview(input: { actorRole: string; action: string; approved: boolean }) {
  const privileged = String(input.actorRole).toUpperCase() === 'ADMIN';
  return {
    privileged,
    action: input.action,
    reviewState: privileged && !input.approved ? 'PENDING_REVIEW' : 'APPROVED',
  };
}
