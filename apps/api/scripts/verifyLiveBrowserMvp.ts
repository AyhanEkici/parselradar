import fs from 'fs';
import path from 'path';

type AuthMeRecord = { index: number; status: number; email: string | null; role: string | null; code: string | null };
type RouteResult = { label: string; path: string; status: 'PASS' | 'FAIL'; detail: string };
type CycleResult = { cycle: number; ok: boolean; detail: string };

const ROOT = process.cwd();
const runtimeProofPath = path.join(ROOT, 'proof/live-browser-mvp-runtime.json');
const bundleProofPath = path.join(ROOT, 'proof/live-browser-mvp-proof-bundle.json');
const bundleProofMdPath = path.join(ROOT, 'proof/live-browser-mvp-proof-bundle.md');
const LOGIN_URL = 'https://parselradar.vercel.app/login';
const API_BASE_URL = 'https://parselradar-production.up.railway.app';

function fail(reason: string, detail: Record<string, unknown> = {}): never {
  console.error(
    JSON.stringify(
      {
        overallStatus: 'FAIL',
        step: 'verify:live-browser-mvp',
        reason,
        detail,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

function writeBundle(payload: any) {
  fs.writeFileSync(bundleProofPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(
    bundleProofMdPath,
    [
      '# Live Browser MVP Proof Bundle',
      '',
      `overallStatus: ${payload.overallStatus}`,
      `navbarPersistenceProof: ${payload.proofs.navbarPersistenceProof.status}`,
      `ctrlF5PersistenceProof: ${payload.proofs.ctrlF5PersistenceProof.status}`,
      `backForwardProof: ${payload.proofs.backForwardProof.status}`,
      `routeTraversalProof: ${payload.proofs.routeTraversalProof.status}`,
      `noAuthCollapseProof: ${payload.proofs.noAuthCollapseProof.status}`,
      '',
    ].join('\n'),
    'utf8',
  );
}

async function main() {
  const password = String(process.env.LIVE_VERIFY_PILOT_PASSWORD || '').trim();
  if (!password) {
    fail('LIVE_VERIFY_PILOT_PASSWORD_REQUIRED', { expectedEnv: 'LIVE_VERIFY_PILOT_PASSWORD' });
  }

  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const routeResults: RouteResult[] = [];

  function currentPath() {
    return new URL(page.url()).pathname;
  }

  async function captureStorage() {
    return page.evaluate(() => ({
      localToken: Boolean(localStorage.getItem('parselradar_token')),
      localUser: Boolean(localStorage.getItem('parselradar_user')),
      lastClearReason: localStorage.getItem('parselradar_last_clear_reason'),
    }));
  }

  async function assertShell(detailLabel: string) {
    await page.waitForLoadState('networkidle');
    const logoutVisible = await page.getByRole('button', { name: /logout/i }).isVisible().catch(() => false);
    const navCount = await page.locator('nav a').count();
    const pathName = currentPath();
    return {
      ok: logoutVisible && navCount > 0 && pathName !== '/login',
      detail: `${detailLabel}: path=${pathName}, logoutVisible=${logoutVisible}, navCount=${navCount}`,
      pathName,
      logoutVisible,
      navCount,
    };
  }

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    await page.getByPlaceholder('E-posta').fill('pilot@test.com');
    await page.getByPlaceholder('Şifre').fill(password);
    await Promise.all([
      page.waitForURL((url: URL) => url.pathname !== '/login', { timeout: 20000 }),
      page.getByRole('button', { name: /giriş yap/i }).click(),
    ]);

    await page.waitForFunction(() => Boolean(localStorage.getItem('parselradar_token')) && Boolean(localStorage.getItem('parselradar_user')));

    const postLoginShell = await assertShell('post_login');
    const storageAfterLogin = await captureStorage();

    const authMeRecords = await page.evaluate(async (baseUrl: string) => {
      const token = localStorage.getItem('parselradar_token');
      const records: AuthMeRecord[] = [];
      for (let index = 1; index <= 10; index += 1) {
        const response = await fetch(`${baseUrl}/auth/me`, {
          method: 'GET',
          headers: {
            authorization: token ? `Bearer ${token}` : '',
            accept: 'application/json',
          },
        });
        let body: any = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }
        records.push({
          index,
          status: response.status,
          email: body?.email || body?.user?.email || null,
          role: body?.role || body?.user?.role || null,
          code: body?.code || null,
        });
      }
      return records;
    }, API_BASE_URL);

    const reloadResults: CycleResult[] = [];
    for (let cycle = 1; cycle <= 5; cycle += 1) {
      await page.reload({ waitUntil: 'networkidle' });
      const result = await assertShell(`reload_${cycle}`);
      reloadResults.push({ cycle, ok: result.ok, detail: result.detail });
    }

    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    const ctrlF5Results: CycleResult[] = [];
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      await client.send('Network.clearBrowserCache');
      await page.reload({ waitUntil: 'networkidle' });
      const result = await assertShell(`ctrlf5_${cycle}`);
      ctrlF5Results.push({ cycle, ok: result.ok, detail: result.detail });
    }

    const navLinks = await page.locator('nav a').evaluateAll((elements: Element[]) =>
      elements.map((element: Element) => ({
        label: (element.textContent || '').trim(),
        path: (element.getAttribute('href') || '').trim(),
      })),
    );

    for (const nav of navLinks) {
      if (!nav.path) continue;
      await page.locator(`nav a[href="${nav.path}"]`).first().click();
      await page.waitForLoadState('networkidle');
      const shell = await assertShell(`route_${nav.path}`);
      routeResults.push({
        label: nav.label,
        path: nav.path,
        status: shell.ok ? 'PASS' : 'FAIL',
        detail: shell.detail,
      });
    }

    const historyStartPath = currentPath();
    await page.goBack({ waitUntil: 'networkidle' });
    const backResult = await assertShell('history_back');
    await page.goForward({ waitUntil: 'networkidle' });
    const forwardResult = await assertShell('history_forward');
    const backForwardPass = backResult.ok && forwardResult.ok;

    const authMeStatuses = authMeRecords.map((record: AuthMeRecord) => record.status);
    const authMeCodes = authMeRecords.map((record: AuthMeRecord) => record.code).filter(Boolean);
    const authMe401 = authMeRecords.filter((record: AuthMeRecord) => record.status === 401).length;
    const authMePass = authMeRecords.every((record: AuthMeRecord) => record.status === 200);
    const routeTraversalPass = routeResults.every((result) => result.status === 'PASS');
    const navbarPass = postLoginShell.ok && reloadResults.every((result) => result.ok);
    const ctrlF5Pass = ctrlF5Results.every((result) => result.ok);

    const runtimePayload = {
      generatedAt: new Date().toISOString(),
      overallStatus: navbarPass && ctrlF5Pass && backForwardPass && routeTraversalPass && authMePass ? 'PASS' : 'FAIL',
      summary: {
        total: 5,
        pass: [navbarPass, ctrlF5Pass, backForwardPass, routeTraversalPass, authMePass].filter(Boolean).length,
        fail: [navbarPass, ctrlF5Pass, backForwardPass, routeTraversalPass, authMePass].filter((value) => !value).length,
        blocked: 0,
      },
      flows: {
        pilotAdminFlow: {
          status: postLoginShell.ok ? 'PASS' : 'FAIL',
          detail: postLoginShell.detail,
        },
        ctrlF5Persistence: {
          status: ctrlF5Pass ? 'PASS' : 'FAIL',
          detail: ctrlF5Results.map((result) => result.detail).join(' | '),
        },
        backForwardPersistence: {
          status: backForwardPass ? 'PASS' : 'FAIL',
          detail: `${backResult.detail} | ${forwardResult.detail} | finalPath=${currentPath()} | historyStartPath=${historyStartPath}`,
        },
        adminRouteTraversal: {
          status: routeTraversalPass ? 'PASS' : 'FAIL',
          detail: routeResults.map((result) => `${result.label}:${result.status}:${result.path}`).join(' | '),
        },
        authMeStorm: {
          status: authMePass ? 'PASS' : 'FAIL',
          detail: `statuses=${authMeStatuses.join(',')} codes=${authMeCodes.join(',') || 'none'}`,
        },
      },
      runtimeEvidence: {
        authMe: {
          total: authMeRecords.length,
          status401: authMe401,
          errorCode: authMeCodes[0] || null,
        },
        storageAfterLogin,
        reloadResults,
        ctrlF5Results,
      },
      authMeRecords,
      routeResults,
    };

    fs.writeFileSync(runtimeProofPath, `${JSON.stringify(runtimePayload, null, 2)}\n`, 'utf8');
    writeBundle({
      overallStatus: runtimePayload.overallStatus,
      proofs: {
        navbarPersistenceProof: { status: navbarPass ? 'PASS' : 'FAIL', detail: postLoginShell.detail },
        ctrlF5PersistenceProof: { status: ctrlF5Pass ? 'PASS' : 'FAIL', detail: runtimePayload.flows.ctrlF5Persistence.detail },
        backForwardProof: { status: backForwardPass ? 'PASS' : 'FAIL', detail: runtimePayload.flows.backForwardPersistence.detail },
        routeTraversalProof: { status: routeTraversalPass ? 'PASS' : 'FAIL', detail: runtimePayload.flows.adminRouteTraversal.detail },
        noAuthCollapseProof: { status: authMePass ? 'PASS' : 'FAIL', detail: runtimePayload.flows.authMeStorm.detail },
      },
      runtimeProof: 'proof/live-browser-mvp-runtime.json',
    });

    if (runtimePayload.overallStatus !== 'PASS') {
      fail('runtime_browser_flow_failed', {
        overallStatus: runtimePayload.overallStatus,
        summary: runtimePayload.summary,
      });
    }

    const result = {
      overallStatus: 'PASS',
      step: 'verify:live-browser-mvp',
      summary: runtimePayload.summary,
      proof: 'proof/live-browser-mvp-runtime.json',
    };

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  fail('runtime_browser_flow_exception', {
    message: error instanceof Error ? error.message : String(error),
  });
});
