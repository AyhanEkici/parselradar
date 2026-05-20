export function securityEscalationRouter(input: { threatLevel: string; blockedEvents: number }) {
  const escalated = input.threatLevel === 'HIGH' || input.threatLevel === 'CRITICAL' || input.blockedEvents > 10;
  return {
    escalated,
    route: escalated ? 'SECURITY_ON_CALL' : 'STANDARD_REVIEW',
  };
}
