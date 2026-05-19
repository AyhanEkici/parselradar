"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROOF_ROOT = exports.WEB_SRC_ROOT = exports.API_SRC_ROOT = exports.REPO_ROOT = void 0;
exports.relativeToRoot = relativeToRoot;
exports.fileExists = fileExists;
exports.readText = readText;
exports.apiPath = apiPath;
exports.webPath = webPath;
exports.repoPath = repoPath;
exports.envIsPresent = envIsPresent;
exports.envMaskDetail = envMaskDetail;
exports.missingEnvKeys = missingEnvKeys;
exports.makeCheck = makeCheck;
exports.makeRouteCheck = makeRouteCheck;
exports.makeRisk = makeRisk;
exports.makeMissingExternalConfig = makeMissingExternalConfig;
exports.normalizeRoutePath = normalizeRoutePath;
exports.joinRoutePath = joinRoutePath;
exports.parseExpressRouterFile = parseExpressRouterFile;
exports.parseIndexMounts = parseIndexMounts;
exports.parseAppRoutes = parseAppRoutes;
exports.sortChecks = sortChecks;
exports.sortRouteChecks = sortRouteChecks;
exports.finalizeSection = finalizeSection;
exports.buildBundle = buildBundle;
exports.ensureProofDirectory = ensureProofDirectory;
exports.loadRootEnvFile = loadRootEnvFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.REPO_ROOT = path_1.default.resolve(__dirname, '../../../..');
exports.API_SRC_ROOT = path_1.default.join(exports.REPO_ROOT, 'apps', 'api', 'src');
exports.WEB_SRC_ROOT = path_1.default.join(exports.REPO_ROOT, 'apps', 'web', 'src');
exports.PROOF_ROOT = path_1.default.join(exports.REPO_ROOT, 'proof');
const statusRank = {
    FAIL: 0,
    WARN: 1,
    SKIPPED: 2,
    PASS: 3,
};
function relativeToRoot(targetPath) {
    return path_1.default.relative(exports.REPO_ROOT, targetPath).replace(/\\/g, '/');
}
function fileExists(targetPath) {
    return fs_1.default.existsSync(targetPath);
}
function readText(targetPath) {
    return fs_1.default.readFileSync(targetPath, 'utf-8');
}
function apiPath(...segments) {
    return path_1.default.join(exports.API_SRC_ROOT, ...segments);
}
function webPath(...segments) {
    return path_1.default.join(exports.WEB_SRC_ROOT, ...segments);
}
function repoPath(...segments) {
    return path_1.default.join(exports.REPO_ROOT, ...segments);
}
function envIsPresent(key) {
    return Boolean(process.env[key]);
}
function envMaskDetail(keys) {
    return keys.map((key) => `${key}=${envIsPresent(key) ? 'PRESENT' : 'MISSING'}`).join(', ');
}
function missingEnvKeys(keys) {
    return keys.filter((key) => !envIsPresent(key));
}
function makeCheck(category, name, status, message, detail) {
    return { category, name, status, message, detail };
}
function makeRouteCheck(category, routeFile, method, routePath, requiresAuth, requiresAdmin) {
    return {
        category,
        routeFile,
        method,
        path: normalizeRoutePath(routePath),
        requiresAuth,
        requiresAdmin,
    };
}
function makeRisk(category, severity, title, detail) {
    return { category, severity, title, detail };
}
function makeMissingExternalConfig(category, key, reason, status = 'WARN') {
    return { category, key, reason, status };
}
function normalizeRoutePath(routePath) {
    const normalized = routePath.replace(/\\/g, '/');
    if (!normalized.startsWith('/')) {
        return `/${normalized}`.replace(/\/+/g, '/');
    }
    return normalized.replace(/\/+/g, '/');
}
function joinRoutePath(basePath, childPath) {
    if (basePath === '/') {
        return normalizeRoutePath(childPath);
    }
    return normalizeRoutePath(`${basePath}/${childPath}`);
}
function parseExpressRouterFile(category, absolutePath, mountBasePath) {
    if (!fileExists(absolutePath)) {
        return [];
    }
    let content = '';
    try {
        content = readText(absolutePath);
    }
    catch {
        return [];
    }
    const routeFile = relativeToRoot(absolutePath);
    const matches = [...content.matchAll(/router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]\s*,([^\n]+)\);/g)];
    return matches.map((match) => {
        const method = match[1].toUpperCase();
        const routePath = joinRoutePath(mountBasePath, match[2]);
        const middlewareArgs = match[3];
        return makeRouteCheck(category, routeFile, method, routePath, /\bauth\b/.test(middlewareArgs), /\badmin\b/.test(middlewareArgs));
    });
}
function parseIndexMounts(indexContent) {
    const mounts = [];
    const directMatches = [...indexContent.matchAll(/app\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z0-9_]+)/g)];
    for (const match of directMatches) {
        mounts.push({ mountPath: normalizeRoutePath(match[1]), symbol: match[2] });
    }
    const wrapperMatches = [
        ...indexContent.matchAll(/app\.use\(\s*['"`]([^'"`]+)['"`]\s*,\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\b([A-Za-z0-9_]+)\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)/g),
    ];
    for (const match of wrapperMatches) {
        mounts.push({ mountPath: normalizeRoutePath(match[1]), symbol: match[2] });
    }
    // Preserve determinism: stable order while removing duplicates.
    const seen = new Set();
    return mounts.filter((mount) => {
        const key = `${mount.mountPath}::${mount.symbol}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function parseAppRoutes(category, absolutePath) {
    if (!fileExists(absolutePath)) {
        return [];
    }
    let content = '';
    try {
        content = readText(absolutePath);
    }
    catch {
        return [];
    }
    const routeFile = relativeToRoot(absolutePath);
    const matches = [...content.matchAll(/app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g)];
    return matches.map((match) => makeRouteCheck(category, routeFile, match[1].toUpperCase(), match[2], false, false));
}
function sortChecks(checks) {
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
function sortRouteChecks(routeChecks) {
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
function finalizeSection(input) {
    const checks = sortChecks(input.checks);
    const passCount = checks.filter((check) => check.status === 'PASS').length;
    const warnCount = checks.filter((check) => check.status === 'WARN').length;
    const failCount = checks.filter((check) => check.status === 'FAIL').length;
    const skippedCount = checks.filter((check) => check.status === 'SKIPPED').length;
    let overallStatus = 'PASS';
    if (failCount > 0) {
        overallStatus = 'FAIL';
    }
    else if (warnCount > 0) {
        overallStatus = 'WARN';
    }
    else if (passCount === 0 && skippedCount > 0) {
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
function buildBundle(sections, metadata) {
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
    let overallStatus = 'PASS';
    if (summary.failCount > 0) {
        overallStatus = 'FAIL';
    }
    else if (summary.warnCount > 0) {
        overallStatus = 'WARN';
    }
    else if (summary.passCount === 0 && summary.skippedCount > 0) {
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
function ensureProofDirectory() {
    fs_1.default.mkdirSync(exports.PROOF_ROOT, { recursive: true });
}
function loadRootEnvFile() {
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
