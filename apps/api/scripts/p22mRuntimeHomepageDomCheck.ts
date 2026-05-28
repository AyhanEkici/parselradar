import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const productionUrl = 'https://parselradar.vercel.app';
  const proofPath = 'proof/p2-2m-production-runtime-dom-check.json';
  const screenshotPath = 'proof/p2-2m-runtime-homepage.png';
  const result: any = {
    productionUrl,
    domLoaded: false,
    runtimeLoginMarkerFound: false,
    runtimeStartMarkerFound: false,
    loginHrefFound: false,
    currentUrl: '',
    screenshotPath,
    consoleErrors: [],
    networkErrors: [],
    checkedAt: new Date().toISOString()
  };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') result.consoleErrors.push(msg.text());
  });
  page.on('requestfailed', req => {
    result.networkErrors.push({ url: req.url(), error: req.failure()?.errorText });
  });
  try {
    const resp = await page.goto(productionUrl, { waitUntil: 'networkidle', timeout: 20000 });
    result.domLoaded = !!resp && resp.ok();
    await page.waitForTimeout(3000); // allow hydration
    result.currentUrl = page.url();
    result.runtimeLoginMarkerFound = await page.$('[data-testid="home-login-link"]') !== null;
    result.runtimeStartMarkerFound = await page.$('[data-testid="home-start-property-check"]') !== null;
    result.loginHrefFound = await page.$('a[href="/login"]') !== null;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } catch (e: any) {
    result.error = e.message || String(e);
  } finally {
    fs.writeFileSync(proofPath, JSON.stringify(result, null, 2));
    await browser.close();
  }
})();
