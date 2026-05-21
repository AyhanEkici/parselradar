import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { syncTucbsLayerCatalog } from '../src/connectors/tucbs/tucbsLayerCatalog';

type Check = { name: string; pass: boolean; detail: string };

const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, 'proof', 'connector-diagnostics-contract.json');
const OUT_MD = path.join(ROOT, 'proof', 'connector-diagnostics-contract.md');
const UI_OUT_JSON = path.join(ROOT, 'proof', 'ogc-diagnostics-ui-contract.json');
const UI_OUT_MD = path.join(ROOT, 'proof', 'ogc-diagnostics-ui-contract.md');

function check(name: string, pass: boolean, detail: string): Check {
  return { name, pass, detail };
}

function withMissingOgcEnv<T>(run: () => Promise<T>): Promise<T> {
  const keys = ['CONNECTOR_TUCBS_WMS_ENDPOINT', 'CONNECTOR_TUCBS_WMTS_ENDPOINT', 'CONNECTOR_TUCBS_WFS_ENDPOINT'] as const;
  const snapshot = new Map<string, string | undefined>();
  for (const key of keys) {
    snapshot.set(key, process.env[key]);
    delete process.env[key];
  }

  return run().finally(() => {
    for (const key of keys) {
      const value = snapshot.get(key);
      if (typeof value === 'undefined') {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

async function main() {
  const backendChecks: Check[] = [];
  const uiChecks: Check[] = [];

  let outboundCalls = 0;
  const originalGet = axios.get;
  (axios as any).get = async (..._args: any[]) => {
    outboundCalls += 1;
    throw new Error('Outbound call should not happen when OGC endpoints are missing.');
  };

  try {
    const result = await withMissingOgcEnv(() => syncTucbsLayerCatalog());
    const services = result.diagnostics?.services || [];
    const byService = new Map(services.map((item) => [item.service, item] as const));

    const expected = [
      {
        service: 'WMS',
        code: 'MISSING_WMS_ENDPOINT',
        message: 'WMS endpoint is not configured.',
      },
      {
        service: 'WMTS',
        code: 'MISSING_WMTS_ENDPOINT',
        message: 'WMTS endpoint is not configured.',
      },
      {
        service: 'WFS',
        code: 'MISSING_WFS_ENDPOINT',
        message: 'WFS endpoint is not configured.',
      },
    ] as const;

    backendChecks.push(
      check(
        'No external fetch is executed when endpoints are missing',
        outboundCalls === 0,
        `axios.get calls=${outboundCalls}`,
      ),
    );

    backendChecks.push(
      check(
        'Connector diagnostics availability resolves to UNAVAILABLE',
        String(result.diagnostics?.availability || '').toUpperCase() === 'UNAVAILABLE',
        `availability=${result.diagnostics?.availability || 'UNKNOWN'}`,
      ),
    );

    backendChecks.push(
      check(
        'Connector diagnostics never default to ACTIVE',
        !services.some((service) => String((service as any).state || '').toUpperCase() === 'ACTIVE'),
        'Service diagnostics state set excludes ACTIVE by default.',
      ),
    );

    for (const exp of expected) {
      const service = byService.get(exp.service as any);
      const state = String((service as any)?.state || '').toUpperCase();
      const availability = String((service as any)?.availability || '').toUpperCase();
      const parseState = String(service?.parseState || '').toUpperCase();
      const errorCode = String((service as any)?.errorCode || '');
      const message = String((service as any)?.message || service?.error || '');
      const action = String((service as any)?.action || '');

      backendChecks.push(
        check(
          `${exp.service} missing endpoint contract`,
          Boolean(service) && state === 'NOT_CONFIGURED' && availability === 'UNAVAILABLE' && parseState === 'SKIPPED',
          `state=${state || 'MISSING'}, availability=${availability || 'MISSING'}, parse=${parseState || 'MISSING'}`,
        ),
      );

      backendChecks.push(
        check(
          `${exp.service} missing endpoint error code and message`,
          errorCode === exp.code && message === exp.message,
          `errorCode=${errorCode || 'MISSING'}, message=${message || 'MISSING'}`,
        ),
      );

      backendChecks.push(
        check(
          `${exp.service} missing endpoint action guidance exists`,
          action.length > 0,
          action || 'MISSING',
        ),
      );
    }

    const uiComponentPath = path.join(ROOT, 'apps/web/src/components/connectors/OgcServiceDiagnosticsCard.tsx');
    const uiComponent = fs.readFileSync(uiComponentPath, 'utf8');

    uiChecks.push(
      check(
        'Frontend does not render legacy error-only text for missing endpoints',
        !uiComponent.includes('error=Missing WMS endpoint') &&
          !uiComponent.includes('error=Missing WMTS endpoint') &&
          !uiComponent.includes('error=Missing WFS endpoint'),
        'Legacy error-only literals are absent from OGC diagnostics card source.',
      ),
    );

    uiChecks.push(
      check(
        'Frontend renders state/errorCode/message/action fields',
        uiComponent.includes('service?.state') &&
          uiComponent.includes('service.errorCode') &&
          uiComponent.includes('service.message || service.error') &&
          uiComponent.includes('service.action'),
        'OGC diagnostics card uses state + errorCode + message + action for display.',
      ),
    );

    uiChecks.push(
      check(
        'Missing endpoint maps to NOT_CONFIGURED display state',
        uiComponent.includes("state === 'NOT_CONFIGURED'") && uiComponent.includes("errorCode.startsWith('MISSING_')"),
        'UI treats MISSING_* endpoint diagnostics as NOT_CONFIGURED state.',
      ),
    );

    const endpointFiles = [
      path.join(ROOT, 'apps/api/src/connectors/ogc/ogcCapabilitiesClient.ts'),
      path.join(ROOT, 'apps/api/src/connectors/tucbs/tucbsLayerCatalog.ts'),
      path.join(ROOT, 'apps/api/src/connectors/connectorRegistry.ts'),
    ];
    const hardcodedEndpointPattern = /https?:\/\//i;
    const hasHardcodedEndpoints = endpointFiles.some((filePath) => hardcodedEndpointPattern.test(fs.readFileSync(filePath, 'utf8')));

    backendChecks.push(
      check(
        'No hardcoded OGC endpoint URLs are introduced',
        !hasHardcodedEndpoints,
        hasHardcodedEndpoints ? 'Detected http(s) URL literal in OGC connector files.' : 'No http(s) URL literals found in OGC connector files.',
      ),
    );

    const connectorsPayloadPath = path.join(ROOT, 'proof', 'platform-proof-bundle.json');
    let activeDefaultDetected = false;
    if (fs.existsSync(connectorsPayloadPath)) {
      const bundle = JSON.parse(fs.readFileSync(connectorsPayloadPath, 'utf8')) as any;
      const checks = Array.isArray(bundle?.flattenedChecks) ? bundle.flattenedChecks : [];
      activeDefaultDetected = checks.some((item: any) =>
        String(item?.name || '').toLowerCase().includes('connector truth state') &&
        String(item?.detail || '').toUpperCase().includes('ACTIVE'),
      );
    }

    backendChecks.push(
      check(
        'No connector is ACTIVE by default',
        !activeDefaultDetected,
        activeDefaultDetected ? 'A connector truth-state detail indicates ACTIVE default.' : 'No ACTIVE default state evidence detected in current proof bundle.',
      ),
    );
  } finally {
    (axios as any).get = originalGet;
  }

  const allChecks = [...backendChecks, ...uiChecks];
  const failed = allChecks.filter((item) => !item.pass);
  const payload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:connector-diagnostics-contract',
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: {
      total: allChecks.length,
      pass: allChecks.length - failed.length,
      fail: failed.length,
    },
    checks: allChecks,
  };

  const uiFailed = uiChecks.filter((item) => !item.pass);
  const uiPayload = {
    generatedAt: new Date().toISOString(),
    step: 'verify:ogc-diagnostics-ui-contract',
    overallStatus: uiFailed.length === 0 ? 'PASS' : 'FAIL',
    summary: {
      total: uiChecks.length,
      pass: uiChecks.length - uiFailed.length,
      fail: uiFailed.length,
    },
    checks: uiChecks,
  };

  const md = [
    '# Connector Diagnostics Contract',
    '',
    `Overall status: ${payload.overallStatus}`,
    '',
    '## Checks',
    ...allChecks.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} - ${item.name}: ${item.detail}`),
    '',
  ].join('\n');

  const uiMd = [
    '# OGC Diagnostics UI Contract',
    '',
    `Overall status: ${uiPayload.overallStatus}`,
    '',
    '## Checks',
    ...uiChecks.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} - ${item.name}: ${item.detail}`),
    '',
  ].join('\n');

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(OUT_MD, `${md}\n`, 'utf8');
  fs.writeFileSync(UI_OUT_JSON, `${JSON.stringify(uiPayload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(UI_OUT_MD, `${uiMd}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        overallStatus: payload.overallStatus,
        step: payload.step,
        proof: 'proof/connector-diagnostics-contract.json',
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        overallStatus: 'FAIL',
        step: 'verify:connector-diagnostics-contract',
        error: String((error as any)?.message || error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});