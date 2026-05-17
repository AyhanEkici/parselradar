import {
  apiPath,
  fileExists,
  finalizeSection,
  makeCheck,
  makeRisk,
  parseAppRoutes,
  parseIndexMounts,
  readText,
  VerificationSection,
  webPath,
} from './platformVerification';

const CATEGORY = 'Routes';

const ROUTE_MOUNTS = [
  { symbol: 'authRoutes', file: apiPath('routes', 'authRoutes.ts'), mountPath: '/auth' },
  { symbol: 'creditRoutes', file: apiPath('routes', 'creditRoutes.ts'), mountPath: '/credits' },
  { symbol: 'stripeRoutes', file: apiPath('routes', 'stripeRoutes.ts'), mountPath: '/stripe' },
  { symbol: 'propertyRoutes', file: apiPath('routes', 'propertyRoutes.ts'), mountPath: '/properties' },
  { symbol: 'documentRoutes', file: apiPath('routes', 'documentRoutes.ts'), mountPath: '/properties' },
  { symbol: 'consentRoutes', file: apiPath('routes', 'consentRoutes.ts'), mountPath: '/properties' },
  { symbol: 'analysisRoutes', file: apiPath('routes', 'analysisRoutes.ts'), mountPath: '/analysis' },
  { symbol: 'reportRoutes', file: apiPath('routes', 'reportRoutes.ts'), mountPath: '/reports' },
  { symbol: 'investorRoutes', file: apiPath('routes', 'investorRoutes.ts'), mountPath: '/investor' },
  { symbol: 'portfolioRoutes', file: apiPath('routes', 'portfolioRoutes.ts'), mountPath: '/investor' },
  { symbol: 'portfolioAnalyticsRoutes', file: apiPath('routes', 'portfolioAnalyticsRoutes.ts'), mountPath: '/investor' },
  { symbol: 'exportRoutes', file: apiPath('routes', 'exportRoutes.ts'), mountPath: '/exports' },
  { symbol: 'organizationRoutes', file: apiPath('routes', 'organizationRoutes.ts'), mountPath: '/' },
  { symbol: 'workspaceRoutes', file: apiPath('routes', 'workspaceRoutes.ts'), mountPath: '/' },
  { symbol: 'sharedAnalysisRoutes', file: apiPath('routes', 'sharedAnalysisRoutes.ts'), mountPath: '/' },
  { symbol: 'notificationRoutes', file: apiPath('routes', 'notificationRoutes.ts'), mountPath: '/' },
  { symbol: 'observabilityRoutes', file: apiPath('routes', 'observabilityRoutes.ts'), mountPath: '/' },
  { symbol: 'connectorActivationRoutes', file: apiPath('routes', 'connectorActivationRoutes.ts'), mountPath: '/' },
  { symbol: 'adminRoutes', file: apiPath('routes', 'adminRoutes.ts'), mountPath: '/admin' },
  { symbol: 'auditRoutes', file: apiPath('routes', 'auditRoutes.ts'), mountPath: '/' },
];

const FRONTEND_PAGES = [
  'Login.tsx',
  'Register.tsx',
  'Dashboard.tsx',
  'InvestorDashboard.tsx',
  'PortfolioDashboard.tsx',
  'PortfolioAnalytics.tsx',
  'WorkspaceDashboard.tsx',
  'WorkspaceActivity.tsx',
  'NotificationInbox.tsx',
  'NotificationPreferences.tsx',
  'AdminObservability.tsx',
  'AdminAuditTimeline.tsx',
  'AdminConnectors.tsx',
  'AdminConnectorDetail.tsx',
];

export function verifyRoutes(): VerificationSection {
  const checks = [];
  const riskRegister = [];
  const indexPath = apiPath('index.ts');
  const indexExists = fileExists(indexPath);
  const indexContent = indexExists ? readText(indexPath) : '';
  const mounts = indexContent ? parseIndexMounts(indexContent) : [];
  const healthRoutes = indexExists ? parseAppRoutes(CATEGORY, indexPath) : [];

  checks.push(makeCheck(CATEGORY, 'API index file exists', fileExists(indexPath) ? 'PASS' : 'FAIL', 'apps/api/src/index.ts presence verified.'));

  for (const routeMount of ROUTE_MOUNTS) {
    const routeFileExists = fileExists(routeMount.file);
    checks.push(
      makeCheck(
        CATEGORY,
        `${routeMount.symbol} file exists`,
        routeFileExists ? 'PASS' : 'FAIL',
        routeFileExists ? 'Mounted route file is present.' : 'Mounted route file is missing.',
      ),
    );
    if (routeFileExists) {
      const routeContent = readText(routeMount.file);
      checks.push(
        makeCheck(
          CATEGORY,
          `${routeMount.symbol} default export`,
          routeContent.includes('export default router') ? 'PASS' : 'FAIL',
          routeContent.includes('export default router') ? 'Route file exports default router.' : 'Route file does not export default router.',
        ),
      );
    }
    checks.push(
      makeCheck(
        CATEGORY,
        `${routeMount.symbol} mounted at ${routeMount.mountPath}`,
        mounts.some((mount) => mount.symbol === routeMount.symbol && mount.mountPath === routeMount.mountPath) ? 'PASS' : 'FAIL',
        mounts.some((mount) => mount.symbol === routeMount.symbol && mount.mountPath === routeMount.mountPath)
          ? 'Route mount found in index.ts.'
          : 'Expected route mount not found in index.ts.',
      ),
    );
  }

  for (const expectedHealthRoute of ['/health', '/health/live', '/health/ready']) {
    checks.push(
      makeCheck(
        CATEGORY,
        `Health route ${expectedHealthRoute}`,
        healthRoutes.some((routeCheck) => routeCheck.path === expectedHealthRoute) ? 'PASS' : 'FAIL',
        healthRoutes.some((routeCheck) => routeCheck.path === expectedHealthRoute)
          ? 'Health route is registered in index.ts.'
          : 'Health route is missing from index.ts.',
      ),
    );
  }

  for (const page of FRONTEND_PAGES) {
    const pagePath = webPath('pages', page);
    checks.push(
      makeCheck(
        CATEGORY,
        `Frontend page ${page}`,
        fileExists(pagePath) ? 'PASS' : 'FAIL',
        fileExists(pagePath) ? 'Expected frontend page file is present.' : 'Expected frontend page file is missing.',
      ),
    );
  }

  if (!mounts.some((mount) => mount.symbol === 'notificationRoutes') || !mounts.some((mount) => mount.symbol === 'connectorActivationRoutes')) {
    riskRegister.push(
      makeRisk(
        CATEGORY,
        'medium',
        'Index route registration drift',
        'One or more expected root-mounted routes are missing from index.ts. Some major platform surfaces may exist on disk but be unreachable at runtime.',
      ),
    );
  }

  return finalizeSection({ category: CATEGORY, checks, routeChecks: healthRoutes, riskRegister });
}
