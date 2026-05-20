export function credentialGovernance(input: { hasRotationPolicy: boolean; rotatedWithinDays: number; maxAgeDays?: number }) {
  const maxAge = input.maxAgeDays || 90;
  return {
    compliant: input.hasRotationPolicy && input.rotatedWithinDays <= maxAge,
    requiresRotation: input.rotatedWithinDays > maxAge,
    maxAgeDays: maxAge,
  };
}
