export function apiExposureAudit() {
  const publicSurface = [
    '/health',
    '/health/live',
    '/health/ready',
    '/auth/*',
  ];

  const protectedSurface = [
    '/admin/*',
    '/notifications/*',
    '/investor/*',
    '/workspace/*',
    '/organizations/*',
  ];

  return {
    securityAuditSummary: {
      publicSurface,
      protectedSurface,
      note: 'Protected routes are expected to be enforced by auth/admin middleware.',
    },
  };
}
