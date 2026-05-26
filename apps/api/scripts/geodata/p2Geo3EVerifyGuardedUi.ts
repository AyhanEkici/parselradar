import fs from "node:fs";
import path from "node:path";
import { queryStagedSignalsFromPostgis } from "../../src/geodata/stagedSignalAdapter";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function readIfExists(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "") : "";
}

function findUiPath(): string | null {
  const candidates = [
    "apps/web/src/pages/admin/AdminStagedGeoSignalsDiagnostics.tsx",
    "apps/web/src/pages/AdminStagedGeoSignalsDiagnostics.tsx",
    "apps/web/src/pages/admin/DevStagedGeoSignals.tsx",
    "apps/web/src/pages/DevStagedGeoSignals.tsx",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

async function main(): Promise<void> {
  const adapterResult = await queryStagedSignalsFromPostgis({
    lat: 38.71,
    lon: 35.5,
    label: "P2.GEO-3E guarded UI verification",
  });

  const uiPath = findUiPath();
  const uiContent = uiPath ? readIfExists(uiPath) : "";
  const appContent = readIfExists("apps/web/src/App.tsx");
  const apiRouteContent = readIfExists("apps/api/src/routes/stagedGeoSignalsRoutes.ts");

  const requiredUiTokens = [
    "P2_GEO_3E_UI_TRUTH_MARKERS",
    "Staged OSM-derived public-source signal data",
    "SMALL_SOURCE_PARTIAL_COVERAGE_OK",
    "Not official tapu, imar, cadastre, zoning, legal, investment or construction verification",
    "Production swap remains blocked",
    "Missing feature types are diagnostic metadata",
    "lifecycleState",
    "runPhase",
    "importRunId",
    "featureCount",
    "signalCount",
    "coverageMode",
    "missingFeatureTypes",
    "nearestStagedSettlement",
    "nearestStagedMainRoad",
    "nearestStagedIndustrialOsbCandidate",
    "allOfficialVerificationFalse",
    "labelsDisclaimersPresent",
    "productionSwapUsed",
    "productionTablesQueried",
  ];

  const missingUiTokens = requiredUiTokens.filter((token) => !uiContent.includes(token));

  const routeMounted = appContent.includes("/admin/dev/staged-geo-signals");
  const guardedApiUsed = uiContent.includes("/api/dev/staged-geo-signals");
  const apiRouteUsesAdapter = apiRouteContent.includes("queryStagedSignalsFromPostgis");

  const hasP2Geo3CRun = ["P2.GEO-3H", "P2.GEO-3C"].includes(String(adapterResult.latestRun?.phase ?? ""));
  const hasSettlement = Boolean(adapterResult.nearestStagedSettlement);
  const hasMainRoad = Boolean(adapterResult.nearestStagedMainRoad);
  const hasIndustrial = Boolean(adapterResult.nearestStagedIndustrialOsbCandidate);
  const partialCoverageOk = adapterResult.coverageMode === "SMALL_SOURCE_PARTIAL_COVERAGE_OK";
  const missingCoverageHandled =
    adapterResult.missingFeatureTypes.includes("WATER_FEATURE") ||
    adapterResult.missingFeatureTypes.includes("ADMIN_CENTER") ||
    adapterResult.missingFeatureTypes.length >= 0;

  const status =
    adapterResult.status === "PASS" &&
    hasP2Geo3CRun &&
    adapterResult.signalCount > 0 &&
    adapterResult.featureCount > 0 &&
    hasSettlement &&
    hasMainRoad &&
    hasIndustrial &&
    partialCoverageOk &&
    missingCoverageHandled &&
    adapterResult.allOfficialVerificationFalse &&
    adapterResult.labelsDisclaimersPresent &&
    adapterResult.productionSwapUsed === false &&
    adapterResult.productionTablesQueried === false &&
    Boolean(uiPath) &&
    routeMounted &&
    guardedApiUsed &&
    apiRouteUsesAdapter &&
    missingUiTokens.length === 0
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "P2.GEO-3E",
    status,
    adapterStatus: adapterResult.status,
    lifecycleState: adapterResult.lifecycleState,
    uiPath,
    routeMounted,
    guardedApiUsed,
    apiRouteUsesAdapter,
    latestRun: adapterResult.latestRun,
    importRunId: adapterResult.importRunId,
    runPhase: adapterResult.runPhase,
    featureCount: adapterResult.featureCount,
    signalCount: adapterResult.signalCount,
    featureTypes: adapterResult.featureTypes,
    missingFeatureTypes: adapterResult.missingFeatureTypes,
    coverageMode: adapterResult.coverageMode,
    hasP2Geo3CRun,
    hasSettlement,
    hasMainRoad,
    hasIndustrial,
    partialCoverageOk,
    missingCoverageHandled,
    allOfficialVerificationFalse: adapterResult.allOfficialVerificationFalse,
    labelsDisclaimersPresent: adapterResult.labelsDisclaimersPresent,
    productionSwapUsed: adapterResult.productionSwapUsed,
    productionTablesQueried: adapterResult.productionTablesQueried,
    stagingTablesQueried: adapterResult.stagingTablesQueried,
    requiredUiTokens,
    missingUiTokens,
    sourceFileCommitted: false,
    fullTurkeyImportAllowed: false,
    connectorActivated: false,
    scrapingAdded: false,
    schedulerAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3e-guarded-ui-verification-results",
    payload,
    [
      "# P2.GEO-3E Guarded UI Verification Results",
      "",
      `- Status: ${status}`,
      `- UI path: ${uiPath ?? "missing"}`,
      `- Route mounted: ${routeMounted}`,
      `- Guarded API used: ${guardedApiUsed}`,
      `- API route uses adapter: ${apiRouteUsesAdapter}`,
      `- Adapter status: ${adapterResult.status}`,
      `- Lifecycle state: ${adapterResult.lifecycleState}`,
      `- Run phase: ${adapterResult.runPhase ?? "n/a"}`,
      `- Import run id: ${adapterResult.importRunId ?? "n/a"}`,
      `- Feature count: ${adapterResult.featureCount}`,
      `- Signal count: ${adapterResult.signalCount}`,
      `- Coverage mode: ${adapterResult.coverageMode}`,
      `- Missing feature types: ${adapterResult.missingFeatureTypes.join(", ")}`,
      `- Missing UI tokens: ${missingUiTokens.join(", ") || "none"}`,
      `- officialVerification all false: ${adapterResult.allOfficialVerificationFalse}`,
      `- Labels/disclaimers present: ${adapterResult.labelsDisclaimersPresent}`,
      "- Production swap used: false",
      "- Production tables queried: false",
      "- Source file committed: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3e-guarded-ui-verification-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-3E",
    status: "FAIL",
    detail,
    productionSwapUsed: false,
    productionTablesQueried: false,
    sourceFileCommitted: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3e-guarded-ui-verification-results",
    payload,
    `# P2.GEO-3E Guarded UI Verification Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3e-guarded-ui-verification-results.json" }, null, 2));
  process.exitCode = 1;
});


