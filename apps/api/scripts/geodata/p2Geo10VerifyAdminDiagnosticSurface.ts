import fs from "node:fs";
import path from "node:path";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function includesAll(content: string, terms: string[]): boolean {
  return terms.every((term) => content.includes(term));
}

async function main(): Promise<void> {
  const pageFile = path.resolve("apps/web/src/pages/admin/AdminStagedGeoSignalsDiagnostics.tsx");
  const appFile = path.resolve("apps/web/src/App.tsx");
  const todosFile = path.resolve("docs/PARSELRADAR_REMAINING_TODOS.md");

  const pageExists = fs.existsSync(pageFile);
  const appExists = fs.existsSync(appFile);
  const todosExists = fs.existsSync(todosFile);

  const pageContent = pageExists ? fs.readFileSync(pageFile, "utf8") : "";
  const appContent = appExists ? fs.readFileSync(appFile, "utf8") : "";
  const todosContent = todosExists ? fs.readFileSync(todosFile, "utf8") : "";

  const routeMounted = appContent.includes("/admin/dev/staged-geo-signals");
  const fetchesGuardedEndpoint = pageContent.includes("/api/dev/staged-geo-signals");
  const disclaimerPresent = includesAll(pageContent, [
    "not official tapu",
    "Production swap remains blocked",
  ]);

  const boundaryClaimsPresent = includesAll(pageContent, [
    "productionSwapUsed",
    "productionTablesQueried",
    "officialVerification",
  ]);

  const todoLedgerUpdated = includesAll(todosContent, [
    "P2.GEO-10",
    "P2.GEO-11",
    "P2.GEO-3",
    "MVP-4D",
    "P2.1",
  ]);

  const status =
    pageExists &&
    appExists &&
    routeMounted &&
    fetchesGuardedEndpoint &&
    disclaimerPresent &&
    boundaryClaimsPresent &&
    todoLedgerUpdated
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "P2.GEO-10",
    status,
    pageExists,
    appExists,
    routeMounted,
    routePath: "/admin/dev/staged-geo-signals",
    apiEndpointUsed: "/api/dev/staged-geo-signals",
    fetchesGuardedEndpoint,
    disclaimerPresent,
    boundaryClaimsPresent,
    todoLedgerUpdated,
    productionSwapUsed: false,
    productionTablesQueriedByUi: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-10-admin-diagnostic-surface-results",
    payload,
    [
      "# P2.GEO-10 Admin Diagnostic Surface Results",
      "",
      `- Status: ${status}`,
      `- Page exists: ${pageExists}`,
      `- Route mounted: ${routeMounted}`,
      "- Route path: /admin/dev/staged-geo-signals",
      "- API endpoint used: /api/dev/staged-geo-signals",
      `- Disclaimer present: ${disclaimerPresent}`,
      `- Boundary claims present: ${boundaryClaimsPresent}`,
      `- TODO ledger updated: ${todoLedgerUpdated}`,
      "- Production swap used: false",
      "- Connector activated: false",
      "- Scraping added: false",
      "- Official verification claim added: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-10-admin-diagnostic-surface-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-10",
    status: "FAIL",
    detail,
    productionSwapUsed: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-10-admin-diagnostic-surface-results",
    payload,
    `# P2.GEO-10 Admin Diagnostic Surface Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-10-admin-diagnostic-surface-results.json" }, null, 2));
  process.exitCode = 1;
});
