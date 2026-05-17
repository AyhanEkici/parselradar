import fs from 'fs';
import { execSync } from 'child_process';
import {
  buildBundle,
  ensureProofDirectory,
  finalizeSection,
  loadRootEnvFile,
  makeCheck,
  makeRisk,
  PlatformProofBundle,
  PROOF_ROOT,
  repoPath,
  VerificationCheck,
  RiskRegisterEntry,
  VerificationSection,
} from './platformVerification';
import { verifyAdmin } from './verifyAdmin';
import { verifyAuth } from './verifyAuth';
import { verifyConnectors } from './verifyConnectors';
import { verifyInvestor } from './verifyInvestor';
import { verifyModels } from './verifyModels';
import { verifyNotifications } from './verifyNotifications';
import { verifyObservability } from './verifyObservability';
import { verifyPortfolio } from './verifyPortfolio';
import { verifyRoutes } from './verifyRoutes';
import { verifyRuntime } from './verifyRuntime';
import { verifyWorkspace } from './verifyWorkspace';

function getGitSha(): string | undefined {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoPath(), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return undefined;
  }
}

function getDirtyWorkingTree(): boolean | undefined {
  try {
    return execSync('git status --porcelain', { cwd: repoPath(), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0;
  } catch {
    return undefined;
  }
}

function buildProofMarkdown(bundle: PlatformProofBundle): string {
  const lines: string[] = [];
  lines.push('# Platform Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push(`Git SHA: ${bundle.gitSha || 'unavailable'}`);
  lines.push(`Dirty working tree: ${bundle.dirtyWorkingTree === undefined ? 'unknown' : bundle.dirtyWorkingTree ? 'true' : 'false'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Sections: ${bundle.summary.totalSections}`);
  lines.push(`- Checks: ${bundle.summary.totalChecks}`);
  lines.push(`- PASS: ${bundle.summary.passCount}`);
  lines.push(`- WARN: ${bundle.summary.warnCount}`);
  lines.push(`- FAIL: ${bundle.summary.failCount}`);
  lines.push(`- SKIPPED: ${bundle.summary.skippedCount}`);
  lines.push('');
  for (const section of bundle.sections) {
    lines.push(`## ${section.category}`);
    lines.push('');
    lines.push(`- Overall: ${section.overallStatus}`);
    lines.push(`- PASS: ${section.passCount}`);
    lines.push(`- WARN: ${section.warnCount}`);
    lines.push(`- FAIL: ${section.failCount}`);
    lines.push(`- SKIPPED: ${section.skippedCount}`);
    lines.push('');
    lines.push('| Status | Check | Message | Detail |');
    lines.push('| --- | --- | --- | --- |');
    for (const check of section.checks) {
      lines.push(`| ${check.status} | ${check.name} | ${check.message.replace(/\|/g, '\\|')} | ${(check.detail || '').replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function buildRiskRegisterMarkdown(bundle: PlatformProofBundle): string {
  const lines = ['# Platform Risk Register', ''];
  if (bundle.riskRegister.length === 0) {
    lines.push('No explicit risks were detected by the static verification harness.');
    lines.push('');
    return `${lines.join('\n')}\n`;
  }
  lines.push('| Severity | Category | Title | Detail |');
  lines.push('| --- | --- | --- | --- |');
  for (const risk of bundle.riskRegister) {
    lines.push(`| ${risk.severity} | ${risk.category} | ${risk.title.replace(/\|/g, '\\|')} | ${risk.detail.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function buildHarnessSafetySection(): VerificationSection {
  const checks: VerificationCheck[] = [];
  const riskRegister: RiskRegisterEntry[] = [];
  const filesToScan = [
    repoPath('apps', 'api', 'src', 'testing', 'platformVerification.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyAuth.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyAdmin.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyInvestor.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyPortfolio.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyWorkspace.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyNotifications.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyConnectors.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyRuntime.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyObservability.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyModels.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'verifyRoutes.ts'),
    repoPath('apps', 'api', 'src', 'testing', 'buildProofBundle.ts'),
    repoPath('scripts', 'verify-platform.ts'),
  ];
  const forbiddenPatterns = [
    /from 'axios'/,
    /from 'mongoose'/,
    /from 'stripe'/,
    /from 'bullmq'/,
    /from 'ioredis'/,
    /\.create\(/,
    /\.save\(/,
    /\.update\(/,
    /\.delete\(/,
    /\.enqueue\(/,
    /\bqueue\.add\(/,
    /\bqueues\.add\(/,
  ];

  function stripSelfDeclaredForbiddenPatterns(content: string): string {
    return content.replace(/const forbiddenPatterns\s*=\s*\[[\s\S]*?\];/m, '');
  }

  for (const filePath of filesToScan) {
    if (!fs.existsSync(filePath)) {
      checks.push(
        makeCheck(
          'Harness Safety',
          `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`,
          'FAIL',
          'Verification source file is missing; harness cannot prove read-only behavior for that module.',
        ),
      );
      continue;
    }

    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      checks.push(
        makeCheck(
          'Harness Safety',
          `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`,
          'FAIL',
          'Verification source file could not be read; harness cannot prove read-only behavior for that module.',
        ),
      );
      continue;
    }

    const baseName = filePath.split(/[/\\]/).slice(-1)[0];
    const scanContent = baseName === 'buildProofBundle.ts' ? stripSelfDeclaredForbiddenPatterns(content) : content;

    const hasForbiddenPattern = forbiddenPatterns.some((pattern) => pattern.test(scanContent));
    checks.push(
      makeCheck(
        'Harness Safety',
        `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`,
        hasForbiddenPattern ? 'FAIL' : 'PASS',
        hasForbiddenPattern
          ? 'Verification source contains a forbidden mutating or external-call pattern.'
          : 'Verification source remains free of obvious mutating or external-call patterns.',
      ),
    );
  }

  checks.push(
    makeCheck(
      'Harness Safety',
      'VERIFY_PLATFORM_ALLOW_EXTERNAL default',
      process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true' ? 'WARN' : 'PASS',
      process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true'
        ? 'VERIFY_PLATFORM_ALLOW_EXTERNAL=true is set, but this harness still performs only static inspection.'
        : 'External verification mode is not enabled by default.',
    ),
  );

  if (process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true') {
    riskRegister.push(
      makeRisk(
        'Harness Safety',
        'medium',
        'External verification flag enabled',
        'The environment allows external verification, but this implementation intentionally stays read-only and static.',
      ),
    );
  }

  return finalizeSection({ category: 'Harness Safety', checks, riskRegister });
}

export function runPlatformVerification(): PlatformProofBundle {
  loadRootEnvFile();
  ensureProofDirectory();

  const sections = [
    buildHarnessSafetySection(),
    verifyRoutes(),
    verifyAuth(),
    verifyAdmin(),
    verifyInvestor(),
    verifyPortfolio(),
    verifyWorkspace(),
    verifyNotifications(),
    verifyConnectors(),
    verifyRuntime(),
    verifyObservability(),
    verifyModels(),
  ];

  const bundle = buildBundle(sections, {
    generatedAt: new Date().toISOString(),
    gitSha: getGitSha(),
    dirtyWorkingTree: getDirtyWorkingTree(),
  });

  fs.writeFileSync(repoPath('proof', 'platform-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(repoPath('proof', 'platform-proof-bundle.md'), buildProofMarkdown(bundle), 'utf-8');
  fs.writeFileSync(repoPath('proof', 'platform-route-checks.json'), `${JSON.stringify(bundle.routeChecks, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(repoPath('proof', 'platform-risk-register.md'), buildRiskRegisterMarkdown(bundle), 'utf-8');

  return bundle;
}

export function runPlatformVerificationCli(): void {
  const bundle = runPlatformVerification();
  process.stdout.write(
    [
      `platform verification: ${bundle.overallStatus}`,
      `checks=${bundle.summary.totalChecks}`,
      `pass=${bundle.summary.passCount}`,
      `warn=${bundle.summary.warnCount}`,
      `fail=${bundle.summary.failCount}`,
      `skipped=${bundle.summary.skippedCount}`,
      `proof=${PROOF_ROOT.replace(/\\/g, '/')}`,
    ].join(' | ') + '\n',
  );
}
