export function retentionGovernanceEngine(input: { auditDays: number; exportDays: number; minimumAuditDays?: number }) {
  const minDays = input.minimumAuditDays || 90;
  return {
    compliant: input.auditDays >= minDays,
    auditDays: input.auditDays,
    exportDays: input.exportDays,
    minimumAuditDays: minDays,
  };
}
