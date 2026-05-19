"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConnectors = verifyConnectors;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Connectors';
const CONNECTOR_FILES = [
    'tkgmConnector.ts',
    'municipalityConnector.ts',
    'listingConnector.ts',
    'infrastructureConnector.ts',
    'demographicConnector.ts',
    'mapGeocodingConnector.ts',
    'emailProviderConnector.ts',
];
const CONNECTOR_MODELS = [
    'ConnectorCredentialProfile.ts',
    'ConnectorActivationRecord.ts',
    'ConnectorTestRun.ts',
    'ConnectorSourceApproval.ts',
];
const CONNECTOR_SERVICES = [
    'activateConnectorIfEligible.ts',
    'buildConnectorActivationAudit.ts',
    'deactivateConnector.ts',
    'connectorRateLimiter.ts',
    'connectorRetryPolicy.ts',
    'connectorFreshnessTracker.ts',
    'executeConnectorTestRun.ts',
    'getConnectorActivationState.ts',
    'storeConnectorCredentialProfile.ts',
    'validateConnectorSamplePayload.ts',
];
function parseStringArray(source) {
    return source
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
}
function verifyConnectors() {
    const checks = [];
    const routeChecks = [];
    const riskRegister = [];
    const missingExternalConfigs = [];
    const connectorStates = [];
    const registryPath = (0, platformVerification_1.apiPath)('connectors', 'connectorExecutionRegistry.ts');
    const routePath = (0, platformVerification_1.apiPath)('routes', 'connectorActivationRoutes.ts');
    const policyPath = (0, platformVerification_1.apiPath)('config', 'connectors', 'connectorActivationPolicies.ts');
    const v23TkgmProductionPath = (0, platformVerification_1.apiPath)('connectors', 'tkgmProductionConnector.ts');
    const v23MunicipalityPlanningPath = (0, platformVerification_1.apiPath)('connectors', 'municipalityPlanningConnector.ts');
    const planningNormalizerPath = (0, platformVerification_1.apiPath)('services', 'planning', 'planningPayloadNormalizer.ts');
    const frontendPlanningFiles = [
        (0, platformVerification_1.webPath)('components', 'planning', 'PlanningLayerAvailabilityCard.tsx'),
        (0, platformVerification_1.webPath)('components', 'planning', 'PlanningSourceFreshnessCard.tsx'),
        (0, platformVerification_1.webPath)('components', 'planning', 'PlanningGovernanceClassificationCard.tsx'),
        (0, platformVerification_1.webPath)('components', 'connectors', 'ConnectorRateLimitCard.tsx'),
        (0, platformVerification_1.webPath)('components', 'connectors', 'ConnectorRetryPolicyCard.tsx'),
        (0, platformVerification_1.webPath)('pages', 'AdminConnectorDetail.tsx'),
    ];
    for (const requiredPath of [registryPath, routePath, policyPath, (0, platformVerification_1.apiPath)('controllers', 'connectorActivationController.ts')]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required connector surface file is present.' : 'Required connector surface file is missing.'));
    }
    for (const v23Path of [v23TkgmProductionPath, v23MunicipalityPlanningPath, planningNormalizerPath]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${v23Path.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(v23Path) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(v23Path) ? 'V23 onboarding surface file is present.' : 'V23 onboarding surface file is missing.'));
    }
    for (const uiPath of frontendPlanningFiles) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${uiPath.split(/[/\\]/).slice(-1)[0]} exists (UI)`, (0, platformVerification_1.fileExists)(uiPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(uiPath) ? 'V23 connector planning UI surface file is present.' : 'V23 connector planning UI surface file is missing.'));
    }
    if ((0, platformVerification_1.fileExists)(registryPath)) {
        const registryContent = (0, platformVerification_1.readText)(registryPath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Execution registry uses V23 TKGM connector', registryContent.includes('tkgmProductionConnectorExecution') ? 'PASS' : 'FAIL', registryContent.includes('tkgmProductionConnectorExecution')
            ? 'Connector execution registry references the V23 TKGM production connector.'
            : 'Connector execution registry does not reference the V23 TKGM production connector.'), (0, platformVerification_1.makeCheck)(CATEGORY, 'Execution registry uses V23 municipality planning connector', registryContent.includes('municipalityPlanningConnectorExecution') ? 'PASS' : 'FAIL', registryContent.includes('municipalityPlanningConnectorExecution')
            ? 'Connector execution registry references the V23 municipality planning connector.'
            : 'Connector execution registry does not reference the V23 municipality planning connector.'));
    }
    if ((0, platformVerification_1.fileExists)(planningNormalizerPath)) {
        const normalizerContent = (0, platformVerification_1.readText)(planningNormalizerPath);
        const hasGovernanceTags = normalizerContent.includes('VERIFIED_FACT') &&
            normalizerContent.includes('DERIVED_ANALYTIC') &&
            normalizerContent.includes('HEURISTIC_SIGNAL') &&
            normalizerContent.includes('INCOMPLETE_DATA') &&
            normalizerContent.includes('HUMAN_REVIEW_ADVISED');
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Planning governance classifications defined', hasGovernanceTags ? 'PASS' : 'FAIL', hasGovernanceTags
            ? 'Planning payload normalizer defines governance classification labels.'
            : 'Planning payload normalizer is missing one or more governance classification labels.'));
    }
    for (const connectorModel of CONNECTOR_MODELS) {
        const modelPath = (0, platformVerification_1.apiPath)('models', connectorModel);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${connectorModel} exists`, (0, platformVerification_1.fileExists)(modelPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(modelPath) ? 'Required connector model file is present.' : 'Required connector model file is missing.'));
    }
    for (const connectorService of CONNECTOR_SERVICES) {
        const servicePath = (0, platformVerification_1.apiPath)('services', 'connectorActivation', connectorService);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${connectorService} exists`, (0, platformVerification_1.fileExists)(servicePath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(servicePath) ? 'Required connector activation service file is present.' : 'Required connector activation service file is missing.'));
    }
    if ((0, platformVerification_1.fileExists)(routePath)) {
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routePath, '/'));
        for (const expectedRoute of [
            '/admin/connectors',
            '/admin/connectors/audit-trail',
            '/admin/connectors/:connectorKey/activation-plan',
            '/admin/connectors/:connectorKey',
            '/admin/connectors/:connectorKey/credentials',
            '/admin/connectors/:connectorKey/test',
            '/admin/connectors/:connectorKey/activate',
            '/admin/connectors/:connectorKey/deactivate',
            '/admin/connectors/:connectorKey/audit',
            '/admin/connectors/:connectorKey/source-approval',
        ]) {
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Connector route ${expectedRoute}`, routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL', routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
                ? 'Expected connector route is declared.'
                : 'Expected connector route declaration is missing.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Connector routes require auth and admin middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin)
            ? 'All connector routes are structurally gated by auth and admin middleware.'
            : 'One or more connector routes are missing auth/admin middleware.'));
    }
    if ((0, platformVerification_1.fileExists)(policyPath)) {
        const policyContent = (0, platformVerification_1.readText)(policyPath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Connector live call policy is explicitly gated', policyContent.includes("allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active'") ? 'PASS' : 'WARN', policyContent.includes("allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active'")
            ? 'Connector live calls stay gated behind CONNECTOR_TEST_MODE=active.'
            : 'Connector live-call policy is not clearly gated by CONNECTOR_TEST_MODE=active.'));
    }
    const allowLive = process.env.CONNECTOR_TEST_MODE === 'active';
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Connector live-call mode', allowLive ? 'WARN' : 'PASS', allowLive
        ? 'CONNECTOR_TEST_MODE=active is set. The verification harness still does not execute live connector calls.'
        : 'Live connector calls remain disabled by configuration.', (0, platformVerification_1.envMaskDetail)(['CONNECTOR_TEST_MODE'])));
    for (const connectorFile of CONNECTOR_FILES) {
        const connectorPath = (0, platformVerification_1.apiPath)('connectors', connectorFile);
        const connectorExists = (0, platformVerification_1.fileExists)(connectorPath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${connectorFile} exists`, connectorExists ? 'PASS' : 'FAIL', connectorExists ? 'Connector contract file is present.' : 'Connector contract file is missing.'));
        if (!connectorExists) {
            continue;
        }
        const connectorContent = (0, platformVerification_1.readText)(connectorPath);
        const keyMatch = connectorContent.match(/key:\s*['"]([^'"]+)['"]/);
        const requiredEnvMatch = connectorContent.match(/requiredEnv:\s*\[([^\]]+)\]/s);
        const legalRequirementMatch = connectorContent.match(/legalRequirement:\s*['"]([^'"]+)['"]/);
        const key = keyMatch ? keyMatch[1] : connectorFile.replace(/Connector\.ts$/, '');
        const requiredEnv = requiredEnvMatch ? parseStringArray(requiredEnvMatch[1]) : [];
        const missingEnv = (0, platformVerification_1.missingEnvKeys)(requiredEnv);
        let state = 'READY_FOR_TEST';
        if (requiredEnv.length > 0 && missingEnv.length === requiredEnv.length) {
            state = 'NOT_CONFIGURED';
        }
        else if (missingEnv.length > 0) {
            state = 'CREDENTIALS_MISSING';
        }
        else if (legalRequirementMatch) {
            state = 'LEGAL_REVIEW_REQUIRED';
        }
        connectorStates.push({
            key,
            state,
            status: state === 'READY_FOR_TEST' ? 'PASS' : 'WARN',
            requiredEnv,
            missingEnv,
            legalRequirement: legalRequirementMatch ? legalRequirementMatch[1] : undefined,
        });
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Connector truth state ${key}`, state === 'READY_FOR_TEST' ? 'PASS' : 'WARN', `Static connector truth state resolved to ${state}.`, requiredEnv.length > 0 ? (0, platformVerification_1.envMaskDetail)(requiredEnv) : 'No required env keys declared.'));
        for (const keyName of missingEnv) {
            missingExternalConfigs.push((0, platformVerification_1.makeMissingExternalConfig)(CATEGORY, keyName, `Connector ${key} is missing a required configuration key.`, 'WARN'));
        }
    }
    riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'medium', 'Connector activation routes are mutating by design', 'Connector credential, test, activation, and deactivation endpoints exist. The verification harness inspects them statically and does not invoke them.'));
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs, connectorStates });
}
