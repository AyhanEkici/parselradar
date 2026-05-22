import fs from 'fs';
import path from 'path';

type ReadinessStatus = 'READY' | 'PARTIAL' | 'MISSING' | 'NOT_APPLICABLE' | 'BLOCKER';
type Severity =
  | 'P0_PRODUCTION_BLOCKER'
  | 'P1_PRE_LAUNCH_REQUIRED'
  | 'P2_HARDENING_REQUIRED'
  | 'P3_OPERATIONAL_IMPROVEMENT'
  | 'P4_FUTURE';
type LaunchRecommendation = 'NOT_READY' | 'INTERNAL_ALPHA_READY' | 'CONTROLLED_BETA_READY' | 'PRODUCTION_READY';

type AuditItem = {
  id: string;
  area: string;
  title: string;
  status: ReadinessStatus;
  severity: Severity;
  evidence: string[];
  recommendation: string;
};

type AuditReport = {
  generatedAt: string;
  phase: 'P2.4A';
  scope: string;
  readinessScore: number;
  launchRecommendation: LaunchRecommendation;
  summary: {
    countsByStatus: Record<ReadinessStatus, number>;
    countsBySeverity: Record<Severity, number>;
    p0Blockers: number;
    p1Requirements: number;
    p2Hardening: number;
  };
  items: AuditItem[];
  buckets: {
    p0: AuditItem[];
    p1: AuditItem[];
    p2: AuditItem[];
  };
};

const ROOT = process.cwd();
const PROOF_DIR = path.join(ROOT, 'proof');

function toPosix(value: string): string {
  return value.replace(/\\/g, '/');
}

function rel(filePath: string): string {
  return toPosix(path.relative(ROOT, filePath));
}

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readSafe(relPath: string): string {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

function includesInFile(relPath: string, re: RegExp): boolean {
  const text = readSafe(relPath);
  return re.test(text);
}

function listFiles(rootDir: string, exts: string[], out: string[] = []): string[] {
  if (!fs.existsSync(rootDir)) return out;
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      listFiles(abs, exts, out);
      continue;
    }
    if (entry.isFile() && exts.some((ext) => abs.endsWith(ext))) out.push(abs);
  }
  return out;
}

function countFilesMatching(files: string[], re: RegExp): number {
  let count = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (re.test(text)) count += 1;
  }
  return count;
}

function writeJson(relPath: string, payload: unknown): void {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeMd(relPath: string, content: string): void {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${content.trim()}\n`, 'utf8');
}

function scoreItem(status: ReadinessStatus): number | null {
  if (status === 'NOT_APPLICABLE') return null;
  if (status === 'READY') return 1;
  if (status === 'PARTIAL') return 0.6;
  if (status === 'MISSING' || status === 'BLOCKER') return 0;
  return 0;
}

function computeScore(items: AuditItem[]): number {
  const values = items.map((x) => scoreItem(x.status)).filter((v): v is number => v !== null);
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(avg * 100);
}

function computeLaunchRecommendation(items: AuditItem[], score: number): LaunchRecommendation {
  const p0 = items.filter((x) => x.severity === 'P0_PRODUCTION_BLOCKER').length;
  const p1 = items.filter((x) => x.severity === 'P1_PRE_LAUNCH_REQUIRED').length;

  if (p0 > 0) return 'NOT_READY';
  if (p1 > 0) return 'INTERNAL_ALPHA_READY';
  if (score >= 95) return 'PRODUCTION_READY';
  return 'CONTROLLED_BETA_READY';
}

function buildReport(scope: string, items: AuditItem[]): AuditReport {
  const countsByStatus: Record<ReadinessStatus, number> = {
    READY: 0,
    PARTIAL: 0,
    MISSING: 0,
    NOT_APPLICABLE: 0,
    BLOCKER: 0,
  };

  const countsBySeverity: Record<Severity, number> = {
    P0_PRODUCTION_BLOCKER: 0,
    P1_PRE_LAUNCH_REQUIRED: 0,
    P2_HARDENING_REQUIRED: 0,
    P3_OPERATIONAL_IMPROVEMENT: 0,
    P4_FUTURE: 0,
  };

  for (const item of items) {
    countsByStatus[item.status] += 1;
    countsBySeverity[item.severity] += 1;
  }

  const readinessScore = computeScore(items);
  const launchRecommendation = computeLaunchRecommendation(items, readinessScore);

  return {
    generatedAt: new Date().toISOString(),
    phase: 'P2.4A',
    scope,
    readinessScore,
    launchRecommendation,
    summary: {
      countsByStatus,
      countsBySeverity,
      p0Blockers: countsBySeverity.P0_PRODUCTION_BLOCKER,
      p1Requirements: countsBySeverity.P1_PRE_LAUNCH_REQUIRED,
      p2Hardening: countsBySeverity.P2_HARDENING_REQUIRED,
    },
    items,
    buckets: {
      p0: items.filter((x) => x.severity === 'P0_PRODUCTION_BLOCKER'),
      p1: items.filter((x) => x.severity === 'P1_PRE_LAUNCH_REQUIRED'),
      p2: items.filter((x) => x.severity === 'P2_HARDENING_REQUIRED'),
    },
  };
}

function reportToMd(title: string, report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`- generatedAt: ${report.generatedAt}`);
  lines.push(`- readinessScore: ${report.readinessScore}`);
  lines.push(`- launchRecommendation: ${report.launchRecommendation}`);
  lines.push(`- p0Blockers: ${report.summary.p0Blockers}`);
  lines.push(`- p1Requirements: ${report.summary.p1Requirements}`);
  lines.push(`- p2Hardening: ${report.summary.p2Hardening}`);
  lines.push('');
  lines.push('## Items');
  for (const item of report.items) {
    lines.push(`- [${item.severity}] (${item.status}) ${item.area} - ${item.title}`);
    lines.push(`  evidence: ${item.evidence.join(' | ') || 'none'}`);
    lines.push(`  recommendation: ${item.recommendation}`);
  }
  return lines.join('\n');
}

function main(): void {
  const docsFiles = listFiles(path.join(ROOT, 'docs'), ['.md']);
  const apiFiles = listFiles(path.join(ROOT, 'apps/api/src'), ['.ts']);
  const webFiles = listFiles(path.join(ROOT, 'apps/web/src'), ['.ts', '.tsx']);
  const sourceFiles = [...apiFiles, ...webFiles];

  const hasEnvMatrix = exists('docs/DEPLOYMENT_ENV_MATRIX.md');
  const hasProdChecklist = exists('docs/PRODUCTION_DEPLOY_CHECKLIST.md');
  const hasStripeReadinessDoc = exists('docs/STRIPE_PRODUCTION_READINESS.md');
  const hasRunbook = exists('docs/U1_PILOT_RUNBOOK.md');

  const hasHealthRoute = includesInFile('apps/api/src/index.ts', /app\.get\('\/health'/);
  const hasBuildInfoRoute = includesInFile('apps/api/src/index.ts', /app\.get\('\/__buildinfo'/);
  const hasRuntimeDiagRoute = includesInFile('apps/api/src/routes/adminRoutes.ts', /\/runtime/);
  const hasObservabilityRoutes = includesInFile('apps/api/src/routes/observabilityRoutes.ts', /\/admin\/observability/) && includesInFile('apps/api/src/routes/observabilityRoutes.ts', /\/admin\/telemetry/);

  const hasCheckoutRoute = includesInFile('apps/api/src/routes/stripeRoutes.ts', /create-checkout-session/);
  const hasWebhookRoute = includesInFile('apps/api/src/routes/stripeRoutes.ts', /\/webhook/)
    && includesInFile('apps/api/src/index.ts', /app\.post\('\/stripe\/webhook'/);
  const hasWebhookSignatureValidation = includesInFile('apps/api/src/controllers/stripeController.ts', /constructEvent\(/)
    && includesInFile('apps/api/src/controllers/stripeController.ts', /STRIPE_WEBHOOK_SECRET/);
  const hasDuplicateCreditGuard = includesInFile('apps/api/src/controllers/stripeController.ts', /checkoutSession\.status !== 'PAID'/);
  const hasCreditOnCompletedOnly = includesInFile('apps/api/src/controllers/stripeController.ts', /event\.type === 'checkout\.session\.completed'/);
  const hasAdminStripeVisibility = includesInFile('apps/api/src/routes/adminRoutes.ts', /\/stripe-sessions/) && includesInFile('apps/web/src/App.tsx', /\/admin\/stripe-sessions/);
  const hasStripeModeDocs = hasStripeReadinessDoc && includesInFile('docs/STRIPE_PRODUCTION_READINESS.md', /test\s*\/\s*live|test and live|Never mix test and live keys/i);

  const hasJwtRequired = includesInFile('apps/api/src/config/env.ts', /JWT_SECRET/);
  const hasAuthGuard = includesInFile('apps/api/src/middleware/auth.ts', /requireAuth/);
  const hasAdminGuard = includesInFile('apps/api/src/middleware/admin.ts', /requireAdmin/);
  const hasRateLimiter = includesInFile('apps/api/src/middleware/rateLimiter.ts', /rateLimit\(/);
  const cookieSecurityExplicit = includesInFile('apps/api/src/controllers/authController.ts', /secure:\s*true|sameSite:\s*'strict'|sameSite:\s*"strict"/);
  const hasCrossUserIsolationSignal = includesInFile('docs/RUNTIME_SMOKE_TESTS.md', /Cross-user ownership protection/i);

  const hasUploadRoute = includesInFile('apps/api/src/routes/documentRoutes.ts', /upload\.single\('file'\)/);
  const hasUploadTypeFilter = includesInFile('apps/api/src/middleware/upload.ts', /allowed\s*=\s*\[/);
  const hasUploadSizeLimit = includesInFile('apps/api/src/middleware/upload.ts', /fileSize:\s*10\s*\*\s*1024\s*\*\s*1024/);
  const hasEvidenceLabeling = includesInFile('apps/api/src/services/provenance/sourceReliabilityClassifier.ts', /UNVERIFIED/)
    || includesInFile('docs/MANUAL_OFFICIAL_EVIDENCE_UPLOAD_RUNBOOK.md', /USER_PROVIDED_OFFICIAL_EVIDENCE/);

  const pagesWithLoading = countFilesMatching(webFiles, /loading|yükleniyor|checking|booting/i);
  const pagesWithError = countFilesMatching(webFiles, /error|hata|failed|retry/i);
  const pagesWithEmpty = countFilesMatching(webFiles, /empty|no data|bulunamad|yok/i);

  const hasAuditLogModel = exists('apps/api/src/models/AuditEvent.ts');
  const hasAuditLogUtil = includesInFile('apps/api/src/utils/auditLog.ts', /AuditEvent\.create/);
  const hasDeploymentTruthVerifier = exists('apps/api/scripts/verifyDeploymentTruth.ts');

  const hasBackupPolicyCode = includesInFile('apps/api/src/config/runtime/backupPolicies.ts', /backupStatus/);
  const hasBackupDoc = includesInFile('docs/PRODUCTION_DEPLOY_CHECKLIST.md', /backup/i);
  const hasRestoreDoc = includesInFile('docs/PRODUCTION_DEPLOY_CHECKLIST.md', /rollback|restore/i);

  const hasIncidentDoc = countFilesMatching(docsFiles.map((f) => f), /incident|on-call|pager/i) > 0;
  const hasSupportBoundaryDoc = hasRunbook && includesInFile('docs/U1_PILOT_RUNBOOK.md', /support|escalation/i);

  const hasConnectorNotConfiguredDefaults = countFilesMatching(apiFiles, /NOT_CONFIGURED/g) > 0;
  const hasConnectorActivationRoutes = includesInFile('apps/api/src/routes/connectorActivationRoutes.ts', /\/admin\/connectors\/.+\/activate/);

  const hasAiChatFeature = countFilesMatching(sourceFiles, /ai chat|chatbot|openai|anthropic|gpt/i) > 0;
  const hasEdevletAutomation = countFilesMatching(sourceFiles, /e-devlet.*autom|selenium|undetected-chromedriver|captcha bypass/i) > 0;
  const hasSahibindenScraper = countFilesMatching(sourceFiles, /sahibinden.*scrap|puppeteer|playwright.*sahibinden/i) > 0;

  const envItems: AuditItem[] = [
    {
      id: 'ENV-001',
      area: 'Environment validation',
      title: 'Required backend env variables validated at startup',
      status: includesInFile('apps/api/src/config/env.ts', /Missing required environment variables/) ? 'READY' : 'PARTIAL',
      severity: 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/config/env.ts', 'apps/api/src/config/envValidator.ts'],
      recommendation: 'Keep runtime fail-fast for required env and extend required list for production-only keys.',
    },
    {
      id: 'ENV-002',
      area: 'Environment validation',
      title: 'Deployment environment matrix documented',
      status: hasEnvMatrix ? 'READY' : 'MISSING',
      severity: hasEnvMatrix ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/DEPLOYMENT_ENV_MATRIX.md'],
      recommendation: 'Maintain a single source of truth for env separation and ownership.',
    },
    {
      id: 'ENV-003',
      area: 'Environment validation',
      title: 'Frontend env exposure restricted to safe VITE fields',
      status: includesInFile('apps/web/src/lib/envValidator.ts', /import\.meta\.env\.VITE_API_URL/) ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/web/src/lib/envValidator.ts', 'apps/web/src/lib/api.ts'],
      recommendation: 'Continue avoiding secret exposure in frontend bundles and keep explicit validator policy.',
    },
    {
      id: 'ENV-004',
      area: 'Environment validation',
      title: 'Production deployment checklist exists',
      status: hasProdChecklist ? 'READY' : 'MISSING',
      severity: hasProdChecklist ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/PRODUCTION_DEPLOY_CHECKLIST.md'],
      recommendation: 'Keep checklist aligned with current runtime and release process.',
    },
  ];

  const paymentItems: AuditItem[] = [
    {
      id: 'PAY-001',
      area: 'Payment/Stripe readiness',
      title: 'Checkout session route exists and is authenticated',
      status: hasCheckoutRoute ? 'READY' : 'MISSING',
      severity: hasCheckoutRoute ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/routes/stripeRoutes.ts', 'apps/api/src/controllers/stripeController.ts'],
      recommendation: 'Keep authenticated checkout creation and package whitelisting.',
    },
    {
      id: 'PAY-002',
      area: 'Payment/Stripe readiness',
      title: 'Webhook endpoint and signature verification are implemented',
      status: hasWebhookRoute && hasWebhookSignatureValidation ? 'READY' : 'MISSING',
      severity: hasWebhookRoute && hasWebhookSignatureValidation ? 'P1_PRE_LAUNCH_REQUIRED' : 'P0_PRODUCTION_BLOCKER',
      evidence: ['apps/api/src/index.ts', 'apps/api/src/routes/stripeRoutes.ts', 'apps/api/src/controllers/stripeController.ts'],
      recommendation: 'Do not launch paid flow without verified webhook signatures.',
    },
    {
      id: 'PAY-003',
      area: 'Payment/Stripe readiness',
      title: 'Credits are granted only on completed payment and guarded for duplicates',
      status: hasCreditOnCompletedOnly && hasDuplicateCreditGuard ? 'READY' : 'PARTIAL',
      severity: hasCreditOnCompletedOnly && hasDuplicateCreditGuard ? 'P1_PRE_LAUNCH_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/controllers/stripeController.ts'],
      recommendation: 'Retain idempotent fulfillment and completed-event-only crediting.',
    },
    {
      id: 'PAY-004',
      area: 'Payment/Stripe readiness',
      title: 'Admin Stripe session visibility exists',
      status: hasAdminStripeVisibility ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/api/src/routes/adminRoutes.ts', 'apps/web/src/App.tsx'],
      recommendation: 'Ensure admin troubleshooting path remains available in production.',
    },
    {
      id: 'PAY-005',
      area: 'Payment/Stripe readiness',
      title: 'Test/live mode clarity documented',
      status: hasStripeModeDocs ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['docs/STRIPE_PRODUCTION_READINESS.md', 'docs/DEPLOYMENT_ENV_MATRIX.md'],
      recommendation: 'Enforce key/source validation in CI to prevent test/live mixups.',
    },
  ];

  const securityItems: AuditItem[] = [
    {
      id: 'SEC-001',
      area: 'Auth/security readiness',
      title: 'JWT secret requirement enforced',
      status: hasJwtRequired ? 'READY' : 'MISSING',
      severity: hasJwtRequired ? 'P1_PRE_LAUNCH_REQUIRED' : 'P0_PRODUCTION_BLOCKER',
      evidence: ['apps/api/src/config/env.ts'],
      recommendation: 'Continue mandatory JWT secret enforcement and rotate secrets per environment.',
    },
    {
      id: 'SEC-002',
      area: 'Auth/security readiness',
      title: 'Cookie/session security settings are explicitly production-hardened',
      status: cookieSecurityExplicit ? 'READY' : 'PARTIAL',
      severity: cookieSecurityExplicit ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/controllers/authController.ts', 'docs/PRODUCTION_DEPLOY_CHECKLIST.md'],
      recommendation: 'Explicitly assert secure + strict cookie policy in auth cookie set paths for production.',
    },
    {
      id: 'SEC-003',
      area: 'Auth/security readiness',
      title: 'Protected route and admin guard coverage exists',
      status: hasAuthGuard && hasAdminGuard ? 'READY' : 'PARTIAL',
      severity: 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/middleware/auth.ts', 'apps/api/src/middleware/admin.ts', 'apps/web/src/App.tsx'],
      recommendation: 'Maintain route guard coverage for all sensitive endpoints and admin UI routes.',
    },
    {
      id: 'SEC-004',
      area: 'Auth/security readiness',
      title: 'Rate limit policies are present on sensitive flows',
      status: hasRateLimiter ? 'PARTIAL' : 'MISSING',
      severity: hasRateLimiter ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/middleware/rateLimiter.ts', 'apps/api/src/routes/stripeRoutes.ts'],
      recommendation: 'Expand coverage and ensure all auth/admin write endpoints are protected by throttling.',
    },
    {
      id: 'SEC-005',
      area: 'Auth/security readiness',
      title: 'Cross-user data isolation indicators present in test/runbook evidence',
      status: hasCrossUserIsolationSignal ? 'PARTIAL' : 'MISSING',
      severity: hasCrossUserIsolationSignal ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/RUNTIME_SMOKE_TESTS.md'],
      recommendation: 'Keep automated ownership assertions in smoke tests and add explicit regression gates in CI.',
    },
  ];

  const evidenceItems: AuditItem[] = [
    {
      id: 'DOC-001',
      area: 'Document/evidence readiness',
      title: 'Upload route exists with auth protection',
      status: hasUploadRoute ? 'READY' : 'MISSING',
      severity: hasUploadRoute ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/routes/documentRoutes.ts'],
      recommendation: 'Retain auth-required upload and access controls for evidence documents.',
    },
    {
      id: 'DOC-002',
      area: 'Document/evidence readiness',
      title: 'File type and size controls are present',
      status: hasUploadTypeFilter && hasUploadSizeLimit ? 'READY' : 'PARTIAL',
      severity: hasUploadTypeFilter && hasUploadSizeLimit ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/middleware/upload.ts'],
      recommendation: 'Add malware scanning and stronger content validation before production scale.',
    },
    {
      id: 'DOC-003',
      area: 'Document/evidence readiness',
      title: 'Evidence source labeling policy exists',
      status: hasEvidenceLabeling ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/api/src/services/provenance/sourceReliabilityClassifier.ts', 'docs/MANUAL_OFFICIAL_EVIDENCE_UPLOAD_RUNBOOK.md'],
      recommendation: 'Enforce source label completeness checks on upload/review lifecycle.',
    },
    {
      id: 'DOC-004',
      area: 'Document/evidence readiness',
      title: 'Sensitive data warning and retention policy are explicit',
      status: includesInFile('docs/LEGAL_BOUNDARIES.md', /sensitive|privacy|official evidence/i) ? 'PARTIAL' : 'MISSING',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['docs/LEGAL_BOUNDARIES.md'],
      recommendation: 'Add explicit data retention/deletion and sensitive-material handling SOP for operations.',
    },
  ];

  const uxItems: AuditItem[] = [
    {
      id: 'UX-001',
      area: 'Error/loading/empty resilience',
      title: 'Core pages contain loading states',
      status: pagesWithLoading >= 15 ? 'READY' : pagesWithLoading >= 8 ? 'PARTIAL' : 'MISSING',
      severity: pagesWithLoading >= 15 ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P2_HARDENING_REQUIRED',
      evidence: [`pagesWithLoading=${pagesWithLoading}`],
      recommendation: 'Standardize loading UX coverage across all user/admin surfaces.',
    },
    {
      id: 'UX-002',
      area: 'Error/loading/empty resilience',
      title: 'Core pages contain error fallback states',
      status: pagesWithError >= 12 ? 'READY' : pagesWithError >= 6 ? 'PARTIAL' : 'MISSING',
      severity: pagesWithError >= 12 ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P2_HARDENING_REQUIRED',
      evidence: [`pagesWithError=${pagesWithError}`],
      recommendation: 'Add explicit recoverable error messaging for remaining page-level API flows.',
    },
    {
      id: 'UX-003',
      area: 'Error/loading/empty resilience',
      title: 'Core pages contain empty-state handling',
      status: pagesWithEmpty >= 8 ? 'READY' : pagesWithEmpty >= 4 ? 'PARTIAL' : 'MISSING',
      severity: pagesWithEmpty >= 8 ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P2_HARDENING_REQUIRED',
      evidence: [`pagesWithEmpty=${pagesWithEmpty}`],
      recommendation: 'Add explicit empty-state UX for list, diagnostics, and evidence screens lacking guidance.',
    },
  ];

  const observabilityItems: AuditItem[] = [
    {
      id: 'OBS-001',
      area: 'Observability',
      title: 'Health and buildinfo endpoints exist',
      status: hasHealthRoute && hasBuildInfoRoute ? 'READY' : 'MISSING',
      severity: hasHealthRoute && hasBuildInfoRoute ? 'P1_PRE_LAUNCH_REQUIRED' : 'P0_PRODUCTION_BLOCKER',
      evidence: ['apps/api/src/index.ts'],
      recommendation: 'Keep health/build metadata endpoints wired for deployment diagnostics.',
    },
    {
      id: 'OBS-002',
      area: 'Observability',
      title: 'Admin runtime/deployment/observability pages and APIs exist',
      status: hasRuntimeDiagRoute && hasObservabilityRoutes ? 'READY' : 'PARTIAL',
      severity: hasRuntimeDiagRoute && hasObservabilityRoutes ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/routes/adminRoutes.ts', 'apps/api/src/routes/observabilityRoutes.ts', 'apps/web/src/App.tsx'],
      recommendation: 'Retain admin observability access and ensure endpoint health checks in release gates.',
    },
    {
      id: 'OBS-003',
      area: 'Observability',
      title: 'Audit log infrastructure exists with metadata sanitization',
      status: hasAuditLogModel && hasAuditLogUtil ? 'READY' : 'PARTIAL',
      severity: hasAuditLogModel && hasAuditLogUtil ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/models/AuditEvent.ts', 'apps/api/src/utils/auditLog.ts'],
      recommendation: 'Preserve sanitization and ensure retention/archival policy for audit logs.',
    },
    {
      id: 'OBS-004',
      area: 'Observability',
      title: 'Deployment-truth verification script exists',
      status: hasDeploymentTruthVerifier ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/api/scripts/verifyDeploymentTruth.ts'],
      recommendation: 'Keep deployment-truth checks in release readiness pipelines.',
    },
  ];

  const backupItems: AuditItem[] = [
    {
      id: 'BKP-001',
      area: 'Backup/recovery',
      title: 'Database backup strategy is documented',
      status: hasBackupDoc ? 'PARTIAL' : 'MISSING',
      severity: hasBackupDoc ? 'P1_PRE_LAUNCH_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/PRODUCTION_DEPLOY_CHECKLIST.md', 'apps/api/src/config/runtime/backupPolicies.ts'],
      recommendation: 'Define concrete RPO/RTO, backup owner, and scheduled verification records.',
    },
    {
      id: 'BKP-002',
      area: 'Backup/recovery',
      title: 'File/document backup strategy is documented',
      status: hasBackupPolicyCode ? 'PARTIAL' : 'MISSING',
      severity: 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/config/runtime/backupPolicies.ts'],
      recommendation: 'Add explicit document storage backup policy and tested restore path.',
    },
    {
      id: 'BKP-003',
      area: 'Backup/recovery',
      title: 'Restore and rollback procedures are documented',
      status: hasRestoreDoc ? 'PARTIAL' : 'MISSING',
      severity: hasRestoreDoc ? 'P2_HARDENING_REQUIRED' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/PRODUCTION_DEPLOY_CHECKLIST.md'],
      recommendation: 'Run and record periodic restore drills with measurable success criteria.',
    },
  ];

  const opsItems: AuditItem[] = [
    {
      id: 'OPS-001',
      area: 'Operational readiness',
      title: 'Pilot/support runbook exists',
      status: hasRunbook ? 'READY' : 'MISSING',
      severity: hasRunbook ? 'P3_OPERATIONAL_IMPROVEMENT' : 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['docs/U1_PILOT_RUNBOOK.md'],
      recommendation: 'Maintain on-call owner and escalation mapping per release.',
    },
    {
      id: 'OPS-002',
      area: 'Operational readiness',
      title: 'Production email provider readiness is explicit',
      status: includesInFile('apps/api/src/services/auth/passwordResetEmailService.ts', /EMAIL_NOT_CONFIGURED|EMAIL_CONFIGURED/) ? 'PARTIAL' : 'MISSING',
      severity: 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/services/auth/passwordResetEmailService.ts', 'apps/api/src/routes/adminRoutes.ts'],
      recommendation: 'Require SMTP readiness checks in release gate and fail deployment if required notifications are mandatory.',
    },
    {
      id: 'OPS-003',
      area: 'Operational readiness',
      title: 'Incident response documentation exists',
      status: hasIncidentDoc ? 'PARTIAL' : 'MISSING',
      severity: hasIncidentDoc ? 'P2_HARDENING_REQUIRED' : 'P2_HARDENING_REQUIRED',
      evidence: ['docs/'],
      recommendation: 'Create incident response playbook with severity matrix and communication protocol.',
    },
    {
      id: 'OPS-004',
      area: 'Operational readiness',
      title: 'Support/debug access boundaries documented',
      status: hasSupportBoundaryDoc ? 'PARTIAL' : 'MISSING',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['docs/U1_PILOT_RUNBOOK.md'],
      recommendation: 'Define who can access admin diagnostics and under what approval path.',
    },
  ];

  const connectorSafetyItems: AuditItem[] = [
    {
      id: 'CON-001',
      area: 'Connector safety',
      title: 'Connector stack defaults to NOT_CONFIGURED for missing endpoints',
      status: hasConnectorNotConfiguredDefaults ? 'READY' : 'PARTIAL',
      severity: 'P1_PRE_LAUNCH_REQUIRED',
      evidence: ['apps/api/src/connectors/', 'apps/api/src/services/connectors/'],
      recommendation: 'Retain fail-safe NOT_CONFIGURED behavior and avoid implicit activation.',
    },
    {
      id: 'CON-002',
      area: 'Connector safety',
      title: 'Connector activation endpoints remain admin-protected and explicit',
      status: hasConnectorActivationRoutes ? 'READY' : 'PARTIAL',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/api/src/routes/connectorActivationRoutes.ts'],
      recommendation: 'Keep explicit activation workflow and legal approval gates.',
    },
  ];

  const futureSafetyItems: AuditItem[] = [
    {
      id: 'FUT-001',
      area: 'AI/future safety',
      title: 'AI chat is not introduced in current runtime',
      status: hasAiChatFeature ? 'PARTIAL' : 'READY',
      severity: 'P4_FUTURE',
      evidence: ['apps/api/src', 'apps/web/src'],
      recommendation: 'Keep AI/chat features out of production scope unless explicitly planned and gated.',
    },
    {
      id: 'FUT-002',
      area: 'AI/future safety',
      title: 'No unsupported automated e-Devlet or scraper/bot tooling in runtime scope',
      status: hasEdevletAutomation || hasSahibindenScraper ? 'PARTIAL' : 'READY',
      severity: 'P2_HARDENING_REQUIRED',
      evidence: ['apps/api/src', 'apps/web/src'],
      recommendation: 'Maintain manual-only governance for unsupported external sources.',
    },
  ];

  const allItems = [
    ...envItems,
    ...paymentItems,
    ...securityItems,
    ...evidenceItems,
    ...uxItems,
    ...observabilityItems,
    ...backupItems,
    ...opsItems,
    ...connectorSafetyItems,
    ...futureSafetyItems,
  ];

  const overall = buildReport('production-readiness-overall', allItems);
  const envReport = buildReport('production-env-readiness', envItems);
  const securityReport = buildReport('production-security-readiness', [...securityItems, ...paymentItems, ...connectorSafetyItems, ...futureSafetyItems]);
  const observabilityReport = buildReport('production-observability-readiness', [...observabilityItems, ...opsItems]);
  const uxReport = buildReport('production-ux-resilience-readiness', [...uxItems, ...evidenceItems]);
  const backupReport = buildReport('production-backup-recovery-readiness', backupItems);

  writeJson('proof/production-readiness-audit.json', overall);
  writeMd('proof/production-readiness-audit.md', reportToMd('Production Readiness Audit', overall));

  writeJson('proof/production-env-readiness-audit.json', envReport);
  writeMd('proof/production-env-readiness-audit.md', reportToMd('Production Environment Readiness Audit', envReport));

  writeJson('proof/production-security-readiness-audit.json', securityReport);
  writeMd('proof/production-security-readiness-audit.md', reportToMd('Production Security Readiness Audit', securityReport));

  writeJson('proof/production-observability-readiness-audit.json', observabilityReport);
  writeMd('proof/production-observability-readiness-audit.md', reportToMd('Production Observability Readiness Audit', observabilityReport));

  writeJson('proof/production-ux-resilience-audit.json', uxReport);
  writeMd('proof/production-ux-resilience-audit.md', reportToMd('Production UX Resilience Audit', uxReport));

  writeJson('proof/production-backup-recovery-audit.json', backupReport);
  writeMd('proof/production-backup-recovery-audit.md', reportToMd('Production Backup Recovery Audit', backupReport));

  const consoleSummary = {
    overallStatus: 'PASS',
    step: 'audit:production-readiness',
    readinessScore: overall.readinessScore,
    launchRecommendation: overall.launchRecommendation,
    p0Blockers: overall.summary.p0Blockers,
    p1Requirements: overall.summary.p1Requirements,
    p2Hardening: overall.summary.p2Hardening,
    proof: {
      overall: 'proof/production-readiness-audit.json',
      env: 'proof/production-env-readiness-audit.json',
      security: 'proof/production-security-readiness-audit.json',
      observability: 'proof/production-observability-readiness-audit.json',
      ux: 'proof/production-ux-resilience-audit.json',
      backupRecovery: 'proof/production-backup-recovery-audit.json',
    },
  };

  fs.mkdirSync(PROOF_DIR, { recursive: true });
  console.log(JSON.stringify(consoleSummary, null, 2));
}

main();
