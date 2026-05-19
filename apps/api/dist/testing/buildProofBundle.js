"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPlatformVerification = runPlatformVerification;
exports.runPlatformVerificationCli = runPlatformVerificationCli;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const platformVerification_1 = require("./platformVerification");
const verifyAdmin_1 = require("./verifyAdmin");
const verifyAuth_1 = require("./verifyAuth");
const verifyConnectors_1 = require("./verifyConnectors");
const verifyInvestor_1 = require("./verifyInvestor");
const verifyModels_1 = require("./verifyModels");
const verifyNotifications_1 = require("./verifyNotifications");
const verifyObservability_1 = require("./verifyObservability");
const verifyPortfolio_1 = require("./verifyPortfolio");
const verifyRoutes_1 = require("./verifyRoutes");
const verifyRuntime_1 = require("./verifyRuntime");
const verifyWorkspace_1 = require("./verifyWorkspace");
function getGitSha() {
    try {
        return (0, child_process_1.execSync)('git rev-parse HEAD', { cwd: (0, platformVerification_1.repoPath)(), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    }
    catch {
        return undefined;
    }
}
function getDirtyWorkingTree() {
    try {
        return (0, child_process_1.execSync)('git status --porcelain', { cwd: (0, platformVerification_1.repoPath)(), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0;
    }
    catch {
        return undefined;
    }
}
function buildProofMarkdown(bundle) {
    const lines = [];
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
function buildRiskRegisterMarkdown(bundle) {
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
function buildHarnessSafetySection() {
    const checks = [];
    const riskRegister = [];
    const filesToScan = [
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'platformVerification.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyAuth.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyAdmin.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyInvestor.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyPortfolio.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyWorkspace.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyNotifications.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyConnectors.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyRuntime.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyObservability.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyModels.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'verifyRoutes.ts'),
        (0, platformVerification_1.repoPath)('apps', 'api', 'src', 'testing', 'buildProofBundle.ts'),
        (0, platformVerification_1.repoPath)('scripts', 'verify-platform.ts'),
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
    function stripSelfDeclaredForbiddenPatterns(content) {
        return content.replace(/const forbiddenPatterns\s*=\s*\[[\s\S]*?\];/m, '');
    }
    for (const filePath of filesToScan) {
        if (!fs_1.default.existsSync(filePath)) {
            checks.push((0, platformVerification_1.makeCheck)('Harness Safety', `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`, 'FAIL', 'Verification source file is missing; harness cannot prove read-only behavior for that module.'));
            continue;
        }
        let content = '';
        try {
            content = fs_1.default.readFileSync(filePath, 'utf-8');
        }
        catch {
            checks.push((0, platformVerification_1.makeCheck)('Harness Safety', `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`, 'FAIL', 'Verification source file could not be read; harness cannot prove read-only behavior for that module.'));
            continue;
        }
        const baseName = filePath.split(/[/\\]/).slice(-1)[0];
        const scanContent = baseName === 'buildProofBundle.ts' ? stripSelfDeclaredForbiddenPatterns(content) : content;
        const hasForbiddenPattern = forbiddenPatterns.some((pattern) => pattern.test(scanContent));
        checks.push((0, platformVerification_1.makeCheck)('Harness Safety', `Read-only scan ${filePath.split(/[/\\]/).slice(-1)[0]}`, hasForbiddenPattern ? 'FAIL' : 'PASS', hasForbiddenPattern
            ? 'Verification source contains a forbidden mutating or external-call pattern.'
            : 'Verification source remains free of obvious mutating or external-call patterns.'));
    }
    checks.push((0, platformVerification_1.makeCheck)('Harness Safety', 'VERIFY_PLATFORM_ALLOW_EXTERNAL default', process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true' ? 'WARN' : 'PASS', process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true'
        ? 'VERIFY_PLATFORM_ALLOW_EXTERNAL=true is set, but this harness still performs only static inspection.'
        : 'External verification mode is not enabled by default.'));
    if (process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true') {
        riskRegister.push((0, platformVerification_1.makeRisk)('Harness Safety', 'medium', 'External verification flag enabled', 'The environment allows external verification, but this implementation intentionally stays read-only and static.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: 'Harness Safety', checks, riskRegister });
}
function runPlatformVerification() {
    (0, platformVerification_1.loadRootEnvFile)();
    (0, platformVerification_1.ensureProofDirectory)();
    const sections = [
        buildHarnessSafetySection(),
        (0, verifyRoutes_1.verifyRoutes)(),
        (0, verifyAuth_1.verifyAuth)(),
        (0, verifyAdmin_1.verifyAdmin)(),
        (0, verifyInvestor_1.verifyInvestor)(),
        (0, verifyPortfolio_1.verifyPortfolio)(),
        (0, verifyWorkspace_1.verifyWorkspace)(),
        (0, verifyNotifications_1.verifyNotifications)(),
        (0, verifyConnectors_1.verifyConnectors)(),
        (0, verifyRuntime_1.verifyRuntime)(),
        (0, verifyObservability_1.verifyObservability)(),
        (0, verifyModels_1.verifyModels)(),
    ];
    const bundle = (0, platformVerification_1.buildBundle)(sections, {
        generatedAt: new Date().toISOString(),
        gitSha: getGitSha(),
        dirtyWorkingTree: getDirtyWorkingTree(),
    });
    fs_1.default.writeFileSync((0, platformVerification_1.repoPath)('proof', 'platform-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
    fs_1.default.writeFileSync((0, platformVerification_1.repoPath)('proof', 'platform-proof-bundle.md'), buildProofMarkdown(bundle), 'utf-8');
    fs_1.default.writeFileSync((0, platformVerification_1.repoPath)('proof', 'platform-route-checks.json'), `${JSON.stringify(bundle.routeChecks, null, 2)}\n`, 'utf-8');
    fs_1.default.writeFileSync((0, platformVerification_1.repoPath)('proof', 'platform-risk-register.md'), buildRiskRegisterMarkdown(bundle), 'utf-8');
    return bundle;
}
function runPlatformVerificationCli() {
    const bundle = runPlatformVerification();
    process.stdout.write([
        `platform verification: ${bundle.overallStatus}`,
        `checks=${bundle.summary.totalChecks}`,
        `pass=${bundle.summary.passCount}`,
        `warn=${bundle.summary.warnCount}`,
        `fail=${bundle.summary.failCount}`,
        `skipped=${bundle.summary.skippedCount}`,
        `proof=${platformVerification_1.PROOF_ROOT.replace(/\\/g, '/')}`,
    ].join(' | ') + '\n');
}
