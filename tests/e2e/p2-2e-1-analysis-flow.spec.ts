import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test("P2.2E-1 browser analysis flow smoke with Kayseri OGC expectation", async ({ page }) => {
  if (!email || !password) {
    throw new Error("Missing E2E_EMAIL or E2E_PASSWORD. Set them before running the browser E2E smoke.");
  }

  await page.goto("/login");

  await page.getByRole("textbox").first().fill(email);
  await page.getByRole("textbox").nth(1).fill(password);

  const submit = page.getByRole("button", { name: /login|sign in|inloggen|giriş/i });
  await submit.click();

  await page.waitForLoadState("networkidle");

  await expect(page).not.toHaveURL(/\/login/i);

  await page.screenshot({
    path: "proof/p2-2e-1-after-login.png",
    fullPage: true,
  });

  const routeCandidates = [
    "/properties/new",
    "/property/new",
    "/new-property",
    "/dashboard",
  ];

  let opened = false;

  for (const route of routeCandidates) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const body = await page.locator("body").innerText().catch(() => "");

    if (/kayseri|analysis|analyze|analyse|property|parcel|parsel|report|ogc|geodata|layer/i.test(body)) {
      opened = true;
      break;
    }
  }

  expect(opened, "Expected an analysis/property/dashboard surface to open").toBeTruthy();

  await page.screenshot({
    path: "proof/p2-2e-1-analysis-surface.png",
    fullPage: true,
  });

  const pageText = await page.locator("body").innerText();

  expect(pageText).toMatch(/analysis|analyze|analyse|property|parcel|parsel|report/i);
  expect(pageText).toMatch(/kayseri|ogc|geodata|layer|signal|map/i);
});
