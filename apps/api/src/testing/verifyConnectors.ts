import {
  apiPath,
  envMaskDetail,
  fileExists,
  finalizeSection,
  makeCheck,
  makeMissingExternalConfig,
  makeRisk,
  parseExpressRouterFile,
  readText,
  VerificationSection,
  ConnectorTruthState,
  missingEnvKeys,
} from './platformVerification';

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
  'executeConnectorTestRun.ts',
  'getConnectorActivationState.ts',
  'storeConnectorCredentialProfile.ts',
  'validateConnectorSamplePayload.ts',
];

function parseStringArray(source: string): string[] {
  return source
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

export function verifyConnectors(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const riskRegister = [];
  const missingExternalConfigs = [];
  const connectorStates: ConnectorTruthState[] = [];
  const registryPath = apiPath('connectors', 'connectorExecutionRegistry.ts');
  const routePath = apiPath('routes', 'connectorActivationRoutes.ts');
  const policyPath = apiPath('config', 'connectors', 'connectorActivationPolicies.ts');

  for (const requiredPath of [registryPath, routePath, policyPath, apiPath('controllers', 'connectorActivationController.ts')]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required connector surface file is present.' : 'Required connector surface file is missing.',
      ),
    );
  }

  for (const connectorModel of CONNECTOR_MODELS) {
    const modelPath = apiPath('models', connectorModel);
    checks.push(
      makeCheck(
        CATEGORY,
        `${connectorModel} exists`,
        fileExists(modelPath) ? 'PASS' : 'FAIL',
        fileExists(modelPath) ? 'Required connector model file is present.' : 'Required connector model file is missing.',
      ),
    );
  }

  for (const connectorService of CONNECTOR_SERVICES) {
    const servicePath = apiPath('services', 'connectorActivation', connectorService);
    checks.push(
      makeCheck(
        CATEGORY,
        `${connectorService} exists`,
        fileExists(servicePath) ? 'PASS' : 'FAIL',
        fileExists(servicePath) ? 'Required connector activation service file is present.' : 'Required connector activation service file is missing.',
      ),
    );
  }

  if (fileExists(routePath)) {
    routeChecks.push(...parseExpressRouterFile(CATEGORY, routePath, '/'));
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
      checks.push(
        makeCheck(
          CATEGORY,
          `Connector route ${expectedRoute}`,
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL',
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
            ? 'Expected connector route is declared.'
            : 'Expected connector route declaration is missing.',
        ),
      );
    }

    checks.push(
      makeCheck(
        CATEGORY,
        'Connector routes require auth and admin middleware',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin) ? 'PASS' : 'FAIL',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin)
          ? 'All connector routes are structurally gated by auth and admin middleware.'
          : 'One or more connector routes are missing auth/admin middleware.',
      ),
    );
  }

  if (fileExists(policyPath)) {
    const policyContent = readText(policyPath);
    checks.push(
      makeCheck(
        CATEGORY,
        'Connector live call policy is explicitly gated',
        policyContent.includes("allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active'") ? 'PASS' : 'WARN',
        policyContent.includes("allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active'")
          ? 'Connector live calls stay gated behind CONNECTOR_TEST_MODE=active.'
          : 'Connector live-call policy is not clearly gated by CONNECTOR_TEST_MODE=active.',
      ),
    );
  }

  const allowLive = process.env.CONNECTOR_TEST_MODE === 'active';
  checks.push(
    makeCheck(
      CATEGORY,
      'Connector live-call mode',
      allowLive ? 'WARN' : 'PASS',
      allowLive
        ? 'CONNECTOR_TEST_MODE=active is set. The verification harness still does not execute live connector calls.'
        : 'Live connector calls remain disabled by configuration.',
      envMaskDetail(['CONNECTOR_TEST_MODE']),
    ),
  );

  for (const connectorFile of CONNECTOR_FILES) {
    const connectorPath = apiPath('connectors', connectorFile);
    const connectorExists = fileExists(connectorPath);
    checks.push(
      makeCheck(
        CATEGORY,
        `${connectorFile} exists`,
        connectorExists ? 'PASS' : 'FAIL',
        connectorExists ? 'Connector contract file is present.' : 'Connector contract file is missing.',
      ),
    );

    if (!connectorExists) {
      continue;
    }

    const connectorContent = readText(connectorPath);
    const keyMatch = connectorContent.match(/key:\s*['"]([^'"]+)['"]/);
    const requiredEnvMatch = connectorContent.match(/requiredEnv:\s*\[([^\]]+)\]/s);
    const legalRequirementMatch = connectorContent.match(/legalRequirement:\s*['"]([^'"]+)['"]/);
    const key = keyMatch ? keyMatch[1] : connectorFile.replace(/Connector\.ts$/, '');
    const requiredEnv = requiredEnvMatch ? parseStringArray(requiredEnvMatch[1]) : [];
    const missingEnv = missingEnvKeys(requiredEnv);

    let state = 'READY_FOR_TEST';
    if (requiredEnv.length > 0 && missingEnv.length === requiredEnv.length) {
      state = 'NOT_CONFIGURED';
    } else if (missingEnv.length > 0) {
      state = 'CREDENTIALS_MISSING';
    } else if (legalRequirementMatch) {
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

    checks.push(
      makeCheck(
        CATEGORY,
        `Connector truth state ${key}`,
        state === 'READY_FOR_TEST' ? 'PASS' : 'WARN',
        `Static connector truth state resolved to ${state}.`,
        requiredEnv.length > 0 ? envMaskDetail(requiredEnv) : 'No required env keys declared.',
      ),
    );

    for (const keyName of missingEnv) {
      missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, keyName, `Connector ${key} is missing a required configuration key.`, 'WARN'));
    }
  }

  riskRegister.push(
    makeRisk(
      CATEGORY,
      'medium',
      'Connector activation routes are mutating by design',
      'Connector credential, test, activation, and deactivation endpoints exist. The verification harness inspects them statically and does not invoke them.',
    ),
  );

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs, connectorStates });
}
