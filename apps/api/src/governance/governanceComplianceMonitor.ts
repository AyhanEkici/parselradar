export function governanceComplianceMonitor(input: { controls: Array<{ key: string; compliant: boolean }> }) {
  const compliantCount = input.controls.filter((c) => c.compliant).length;
  const total = input.controls.length;
  return {
    compliantCount,
    total,
    complianceRate: total > 0 ? Math.round((compliantCount / total) * 100) : 0,
    overallCompliant: total > 0 && compliantCount === total,
  };
}
