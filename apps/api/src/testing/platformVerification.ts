import fs from 'fs';
import path from 'path';

export type CheckStatus = 'PASS' | 'WARN' | 'FAIL' | 'SKIPPED';

export interface VerificationCheck {
  category: string;
  name: string;
  status: CheckStatus;
  message: string;
  detail?: string;
}

export interface RouteCheck {
  category: string;
  routeFile: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requiresAuth: boolean;
  requiresAdmin: boolean;
}

export interface RiskRegisterEntry {
  category: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  detail: string;
}

export interface MissingExternalConfig {
  category: string;
  key: string;
  reason: string;
  status: 'WARN' | 'SKIPPED';
}

export interface ConnectorTruthState {
  key: string;
  state: string;
  status: CheckStatus;
  requiredEnv: string[];
  missingEnv: string[];
  legalRequirement?: string;
}

export interface RuntimeTruthStateProof {
  key: string;
  state: string;
  status: CheckStatus;
  reason: string;
}

export interface NotificationTruthState {
  channel: string;
  state: string;
  status: CheckStatus;
  missingEnv: string[];
}

export interface VerificationSection {
  category: string;
  checks: VerificationCheck[];
  routeChecks: RouteCheck[];
  riskRegister: RiskRegisterEntry[];
  missingExternalConfigs: MissingExternalConfig[];
  connectorStates: ConnectorTruthState[];
  runtimeStates: RuntimeTruthStateProof[];
  notificationStates: NotificationTruthState[];
  passCount: number;
  warnCount: number;
  failCount: number;
  skippedCount: number;
  overallStatus: CheckStatus;
}

export interface PlatformProofBundle {
  generatedAt: string;
  gitSha?: string;
  dirtyWorkingTree?: boolean;
  overallStatus: CheckStatus;
  summary: {
    totalSections: number;
    totalChecks: number;
    passCount: number;
    warnCount: number;
    failCount: number;
    skippedCount: number;
  };
  sections: VerificationSection[];
  checks: VerificationCheck[];
  routeChecks: RouteCheck[];
  riskRegister: RiskRegisterEntry[];
  missingExternalConfigs: MissingExternalConfig[];
  connectorStates: ConnectorTruthState[];
  runtimeStates: RuntimeTruthStateProof[];
  notificationStates: NotificationTruthState[];
}

export const REPO_ROOT = path.resolve(__dirname, '../../../..');
export const API_SRC_ROOT = path.join(REPO_ROOT, 'apps', 'api', 'src');
export const WEB_SRC_ROOT = path.join(REPO_ROOT, 'apps', 'web', 'src');
export const PROOF_ROOT = path.join(REPO_ROOT, 'proof');

const statusRank: Record<CheckStatus, number> = {
  FAIL: 0,
  WARN: 1,
  SKIPPED: 2,
  PASS: 3,
};

export function relativeToRoot(targetPath: string): string {
  return path.relative(REPO_ROOT, targetPath).replace(/\\/g, '/');
}

export function fileExists(targetPath: string): boolean {
  return fs.existsSync(targetPath);
}

export function readText(targetPath: string): string {
  return fs.readFileSync(targetPath, 'utf-8');
}

export function apiPath(...segments: string[]): string {
  return path.join(API_SRC_ROOT, ...segments);
}

export function webPath(...segments: string[]): string {
  return path.join(WEB_SRC_ROOT, ...segments);
}

export function repoPath(...segments: string[]): string {
  return path.join(REPO_ROOT, ...segments);
}

export function envIsPresent(key: string): boolean {
  return Boolean(process.env[key]);
}

export function envMaskDetail(keys: string[]): string {
  return keys.map((key) => `${key}=${envIsPresent(key) ? 'PRESENT' : 'MISSING'}`).join(', ');
}

export function missingEnvKeys(keys: string[]): string[] {
  return keys.filter((key) => !envIsPresent(key));
}

export function makeCheck(
  category: string,
  name: string,
  status: CheckStatus,
  message: string,
  detail?: string,
): VerificationCheck {
  return { category, name, status, message, detail };
}

export function makeRouteCheck(
  category: string,
  routeFile: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  routePath: string,
  requiresAuth: boolean,
  requiresAdmin: boolean,
): RouteCheck {
  return {
    category,
    routeFile,
    method,
    path: normalizeRoutePath(routePath),
    requiresAuth,
    requiresAdmin,
  };
}

export function makeRisk(
  category: string,
  severity: 'low' | 'medium' | 'high',
  title: string,
  detail: string,
): RiskRegisterEntry {
  return { category, severity, title, detail };
}

export function makeMissingExternalConfig(
  category: string,
  key: string,
  reason: string,
  status: 'WARN' | 'SKIPPED' = 'WARN',
): MissingExternalConfig {
  return { category, key, reason, status };
}

export function normalizeRoutePath(routePath: string): string {
  const normalized = routePath.replace(/\\/g, '/');
  if (!normalized.startsWith('/')) {
    return `/${normalized}`.replace(/\/+/g, '/');
  }
  return normalized.replace(/\/+/g, '/');
}

export function joinRoutePath(basePath: string, childPath: string): string {
  if (basePath === '/') {
    return normalizeRoutePath(childPath);
  }
  return normalizeRoutePath(`${basePath}/${childPath}`);
}

export function parseExpressRouterFile(
  category: string,
  absolutePath: string,
  mountBasePath: string,
): RouteCheck[] {
  if (!fileExists(absolutePath)) {
    return [];
  }

  let content = '';
  try {
    content = readText(absolutePath);
  } catch {
    return [];
  }

  const routeFile = relativeToRoot(absolutePath);
  const matches = [...content.matchAll(/router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,([^\n]+)\);/g)];

  return matches.map((match) => {
    const method = match[1].toUpperCase() as RouteCheck['method'];
    const routePath = joinRoutePath(mountBasePath, match[2]);
    const middlewareArgs = match[3];

    return makeRouteCheck(
      category,
      routeFile,
      method,
      routePath,
      /\bauth\b/.test(middlewareArgs),
      /\badmin\b/.test(middlewareArgs),
    );
  });
}

export function parseIndexMounts(indexContent: string): Array<{ mountPath: string; symbol: string }> {
  return [...indexContent.matchAll(/app\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z0-9_]+)/g)].map((match) => ({
    mountPath: normalizeRoutePath(match[1]),
    symbol: match[2],
  }));
}

export function parseAppRoutes(category: string, absolutePath: string): RouteCheck[] {
  if (!fileExists(absolutePath)) {
    return [];
  }

  let content = '';
  try {
    content = readText(absolutePath);
  } catch {
    return [];
  }

  const routeFile = relativeToRoot(absolutePath);
  const matches = [...content.matchAll(/app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g)];

  return matches.map((match) =>
    makeRouteCheck(category, routeFile, match[1].toUpperCase() as RouteCheck['method'], match[2], false, false),
  );
}

export function sortChecks(checks: VerificationCheck[]): VerificationCheck[] {
  return [...checks].sort((left, right) => {
    if (left.category !== right.category) {
      return left.category.localeCompare(right.category);
    }
    if (statusRank[left.status] !== statusRank[right.status]) {
      return statusRank[left.status] - statusRank[right.status];
    }
    return left.name.localeCompare(right.name);
  });
}

export function sortRouteChecks(routeChecks: RouteCheck[]): RouteCheck[] {
  return [...routeChecks].sort((left, right) => {
    if (left.path !== right.path) {
      return left.path.localeCompare(right.path);
    }
    if (left.method !== right.method) {
      return left.method.localeCompare(right.method);
    }
    return left.routeFile.localeCompare(right.routeFile);
  });
}

export function finalizeSection(input: {
  category: string;
  checks: VerificationCheck[];
  routeChecks?: RouteCheck[];
  riskRegister?: RiskRegisterEntry[];
  missingExternalConfigs?: MissingExternalConfig[];
  connectorStates?: ConnectorTruthState[];
  runtimeStates?: RuntimeTruthStateProof[];
  notificationStates?: NotificationTruthState[];
}): VerificationSection {
  const checks = sortChecks(input.checks);
  const passCount = checks.filter((check) => check.status === 'PASS').length;
  const warnCount = checks.filter((check) => check.status === 'WARN').length;
  const failCount = checks.filter((check) => check.status === 'FAIL').length;
  const skippedCount = checks.filter((check) => check.status === 'SKIPPED').length;

  let overallStatus: CheckStatus = 'PASS';
  if (failCount > 0) {
    overallStatus = 'FAIL';
  } else if (warnCount > 0) {
    overallStatus = 'WARN';
  } else if (passCount === 0 && skippedCount > 0) {
    overallStatus = 'SKIPPED';
  }

  return {
    category: input.category,
    checks,
    routeChecks: sortRouteChecks(input.routeChecks || []),
    riskRegister: [...(input.riskRegister || [])],
    missingExternalConfigs: [...(input.missingExternalConfigs || [])],
    connectorStates: [...(input.connectorStates || [])],
    runtimeStates: [...(input.runtimeStates || [])],
    notificationStates: [...(input.notificationStates || [])],
    passCount,
    warnCount,
    failCount,
    skippedCount,
    overallStatus,
  };
}

export function buildBundle(
  sections: VerificationSection[],
  metadata: { generatedAt: string; gitSha?: string; dirtyWorkingTree?: boolean },
): PlatformProofBundle {
  const orderedSections = [...sections].sort((left, right) => left.category.localeCompare(right.category));
  const checks = sortChecks(orderedSections.flatMap((section) => section.checks));
  const routeChecks = sortRouteChecks(orderedSections.flatMap((section) => section.routeChecks));
  const riskRegister = orderedSections.flatMap((section) => section.riskRegister);
  const missingExternalConfigs = orderedSections.flatMap((section) => section.missingExternalConfigs);
  const connectorStates = orderedSections.flatMap((section) => section.connectorStates);
  const runtimeStates = orderedSections.flatMap((section) => section.runtimeStates);
  const notificationStates = orderedSections.flatMap((section) => section.notificationStates);

  const summary = {
    totalSections: orderedSections.length,
    totalChecks: checks.length,
    passCount: checks.filter((check) => check.status === 'PASS').length,
    warnCount: checks.filter((check) => check.status === 'WARN').length,
    failCount: checks.filter((check) => check.status === 'FAIL').length,
    skippedCount: checks.filter((check) => check.status === 'SKIPPED').length,
  };

  let overallStatus: CheckStatus = 'PASS';
  if (summary.failCount > 0) {
    overallStatus = 'FAIL';
  } else if (summary.warnCount > 0) {
    overallStatus = 'WARN';
  } else if (summary.passCount === 0 && summary.skippedCount > 0) {
    overallStatus = 'SKIPPED';
  }

  return {
    generatedAt: metadata.generatedAt,
    gitSha: metadata.gitSha,
    dirtyWorkingTree: metadata.dirtyWorkingTree,
    overallStatus,
    summary,
    sections: orderedSections,
    checks,
    routeChecks,
    riskRegister,
    missingExternalConfigs,
    connectorStates,
    runtimeStates,
    notificationStates,
  };
}

export function ensureProofDirectory(): void {
  fs.mkdirSync(PROOF_ROOT, { recursive: true });
}

export function loadRootEnvFile(): void {
  const envPath = repoPath('.env');
  if (!fileExists(envPath)) {
    return;
  }

  const content = readText(envPath);
  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}
