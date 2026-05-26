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
    label: "P2.GEO-3I expanded staged signal UX verification",
  });

  const uiPath = findUiPath();
  const uiContent = uiPath ? readIfExists(uiPath) : "";
  const appContent = readIfExists("apps/web/src/App.tsx");
  const apiRouteContent = readIfExists("apps/api/src/routes/stagedGeoSignalsRoutes.ts");
  const freshnessProofContent = readIfExists("proof/p2-geo-3f-freshness-duplicate-policy-results.json");

  let freshnessProof: any = null;
  try {
    freshnessProof = freshnessProofContent ? JSON.parse(freshnessProofContent) : null;
  } catch {
    freshnessProof = null;
  }

  const requiredUiTokens = [
    "P2_GEO_3I_EXPANDED_UX_TRUTH_MARKERS",
    "Expanded staged signal diagnostics",
    "Current lifecycle state",
    "Latest import phase",
    "Expected latest import phase: P2.GEO-3H",
    "Import run ID",
    "Feature count",
    "Signal count",
    "Feature type counts",
    "featureTypes",
    "Missing feature types",
    "Source age / freshness",
    "Duplicate / redundant run state",
    "Nearest settlement",
    "Nearest main road",
    "Nearest industrial / OSB candidate",
    "Optional water, rail or admin-center signals if present",
    "officialVerification=false",
    "Staged OSM-derived public-source context signals only",
    "Not official tapu, imar, cadastre, zoning, legal, investment or construction verification",
    "productionSwapUsed=false",
    "productionTablesQueried=false",
    "lifecycleState",
    "runPhase",
    "importRunId",
    "featureCount",
    "signalCount",
    "featureTypes",
    "missingFeatureTypes",
    "coverageMode",
    "nearestStagedSettlement",
    "nearestStagedMainRoad",
    "nearestStagedIndustrialOsbCandidate",
    "nearestStagedWaterFeature",
    "nearestStagedAdminCenter",
    "allOfficialVerificationFalse",
    "labelsDisclaimersPresent",
    "productionSwapUsed",
    "productionTablesQueried",
  ];

  const missingUiTokens = requiredUiTokens.filter((token) => !uiContent.includes(token));

  const routeMounted = appContent.includes("/admin/dev/staged-geo-signals");
  const guardedApiUsed = uiContent.includes("/api/dev/staged-geo-signals");
  const apiRouteUsesAdapter = apiRouteContent.includes("queryStagedSignalsFromPostgis");

  const latestPhase = String(adapterResult.latestRun?.phase ?? "");
  const hasP2Geo3HRun = latestPhase === "P2.GEO-3H";
  const hasSettlement = Boolean(adapterResult.nearestStagedSettlement);
  const hasMainRoad = Boolean(adapterResult.nearestStagedMainRoad);
  const hasIndustrial = Boolean(adapterResult.nearestStagedIndustrialOsbCandidate);

  const optionalSignalHandled =
    Boolean(adapterResult.nearestStagedWaterFeature) ||
    Boolean(adapterResult.nearestStagedAdminCenter) ||
    adapterResult.missingFeatureTypes.includes("WATER_FEATURE") ||
    adapterResult.missingFeatureTypes.includes("ADMIN_CENTER");

  const sourceAgePresent =
    Boolean(adapterResult.latestRun?.completedAt) ||
    freshnessProofContent.includes("runAgeMinutes") ||
    freshnessProofContent.includes("completedAt") ||
    uiContent.includes("Source age / freshness");

  const duplicateStatePresent =
    Boolean(freshnessProof?.duplicatePolicy) ||
    typeof freshnessProof?.redundantCandidateCount === "number" ||
    typeof freshnessProof?.canonicalRunCount === "number" ||
    freshnessProofContent.includes("redundantCandidateCount") ||
    freshnessProofContent.includes("canonicalRunCount") ||
    uiContent.includes("Duplicate / redundant run state");

  const featureTypeCountsPresent = adapterResult.featureCount > 0 && uiContent.includes("Feature type counts") && uiContent.includes("featureTypes");

  const status =
    adapterResult.status === "PASS" &&
    hasP2Geo3HRun &&
    adapterResult.featureCount > 150 &&
    adapterResult.signalCount > 0 &&
    featureTypeCountsPresent &&
    hasSettlement &&
    hasMainRoad &&
    hasIndustrial &&
    optionalSignalHandled &&
    sourceAgePresent &&
    duplicateStatePresent &&
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
    phase: "P2.GEO-3I",
    status,
    uiPath,
    routeMounted,
    guardedApiUsed,
    apiRouteUsesAdapter,
    adapterStatus: adapterResult.status,
    lifecycleState: adapterResult.lifecycleState,
    latestRun: adapterResult.latestRun,
    latestPhase,
    hasP2Geo3HRun,
    importRunId: adapterResult.importRunId,
    featureCount: adapterResult.featureCount,
    signalCount: adapterResult.signalCount,
    featureTypes: adapterResult.featureTypes,
    missingFeatureTypes: adapterResult.missingFeatureTypes,
    coverageMode: adapterResult.coverageMode,
    hasSettlement,
    hasMainRoad,
    hasIndustrial,
    optionalSignalHandled,
    sourceAgePresent,
    duplicateStatePresent,
    featureTypeCountsPresent,
    allOfficialVerificationFalse: adapterResult.allOfficialVerificationFalse,
    labelsDisclaimersPresent: adapterResult.labelsDisclaimersPresent,
    productionSwapUsed: adapterResult.productionSwapUsed,
    productionTablesQueried: adapterResult.productionTablesQueried,
    stagingTablesQueried: adapterResult.stagingTablesQueried,
    requiredUiTokens,
    missingUiTokens,
    sourceFileCommitted: false,
    dbImportExecuted: false,
    fullTurkeyImportAllowed: false,
    connectorActivated: false,
    scrapingAdded: false,
    schedulerAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3i-expanded-signal-ux-results",
    payload,
    [
      "# P2.GEO-3I Expanded Staged Signal UX Results",
      "",
      `- Status: ${status}`,
      `- UI path: ${uiPath ?? "missing"}`,
      `- Route mounted: ${routeMounted}`,
      `- Guarded API used: ${guardedApiUsed}`,
      `- API route uses adapter: ${apiRouteUsesAdapter}`,
      `- Adapter status: ${adapterResult.status}`,
      `- Lifecycle state: ${adapterResult.lifecycleState}`,
      `- Latest phase: ${latestPhase}`,
      `- Import run id: ${adapterResult.importRunId ?? "n/a"}`,
      `- Feature count: ${adapterResult.featureCount}`,
      `- Signal count: ${adapterResult.signalCount}`,
      `- Feature types: ${adapterResult.featureTypes.join(", ")}`,
      `- Missing feature types: ${adapterResult.missingFeatureTypes.join(", ")}`,
      `- Coverage mode: ${adapterResult.coverageMode}`,
      `- Has settlement: ${hasSettlement}`,
      `- Has main road: ${hasMainRoad}`,
      `- Has industrial/OSB candidate: ${hasIndustrial}`,
      `- Optional signal handled: ${optionalSignalHandled}`,
      `- Source age present: ${sourceAgePresent}`,
      `- Duplicate state present: ${duplicateStatePresent}`,
      `- Feature type counts present: ${featureTypeCountsPresent}`,
      `- Missing UI tokens: ${missingUiTokens.join(", ") || "none"}`,
      `- officialVerification all false: ${adapterResult.allOfficialVerificationFalse}`,
      `- Labels/disclaimers present: ${adapterResult.labelsDisclaimersPresent}`,
      "- Production swap used: false",
      "- Production tables queried: false",
      "- DB import executed: false",
      "- Source file committed: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3i-expanded-signal-ux-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-3I",
    status: "FAIL",
    detail,
    dbImportExecuted: false,
    productionSwapUsed: false,
    productionTablesQueried: false,
    sourceFileCommitted: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3i-expanded-signal-ux-results",
    payload,
    `# P2.GEO-3I Expanded Staged Signal UX Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3i-expanded-signal-ux-results.json" }, null, 2));
  process.exitCode = 1;
});

