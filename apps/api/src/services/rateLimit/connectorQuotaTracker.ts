export function connectorQuotaTracker(input: {
  connectorKey: string;
  used: number;
  quota: number;
}) {
  const normalizedQuota = Math.max(1, input.quota);
  const usagePct = Math.round((Math.max(0, input.used) / normalizedQuota) * 100);
  return {
    connectorKey: input.connectorKey,
    used: Math.max(0, input.used),
    quota: normalizedQuota,
    usagePct,
    nearLimit: usagePct >= 80,
  };
}
