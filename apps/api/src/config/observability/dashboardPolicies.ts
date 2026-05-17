export function resolveDashboardPolicy() {
  const dashboardEnabled = process.env.OBSERVABILITY_DASHBOARD_ENABLED !== 'false';
  const retentionDays = Number(process.env.OBSERVABILITY_RETENTION_DAYS || 30);

  return {
    dashboardState: dashboardEnabled ? 'ACTIVE' : 'DISABLED',
    retentionDays,
  };
}
