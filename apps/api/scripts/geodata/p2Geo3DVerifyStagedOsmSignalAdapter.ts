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

async function main(): Promise<void> {
  const result = await queryStagedSignalsFromPostgis();

  const hasP2Geo3CRun = ["P2.GEO-3H", "P2.GEO-3C"].includes(String(result.latestRun?.phase ?? ""));
  const hasSettlement = Boolean(result.nearestStagedSettlement);
  const hasMainRoad = Boolean(result.nearestStagedMainRoad);
  const hasIndustrial = Boolean(result.nearestStagedIndustrialOsbCandidate);
  const waterMissingHandled = Boolean(result.nearestStagedWaterFeature) || (result.missingFeatureTypes.includes("WATER_FEATURE") && result.nearestStagedWaterFeature === null);
  const adminCenterMissingHandled = Boolean(result.nearestStagedAdminCenter) || (result.missingFeatureTypes.includes("ADMIN_CENTER") && result.nearestStagedAdminCenter === null);

  const status =
    result.status === "PASS" &&
    hasP2Geo3CRun &&
    result.featureCount > 0 &&
    result.signalCount > 0 &&
    hasSettlement &&
    hasMainRoad &&
    hasIndustrial &&
    waterMissingHandled &&
    adminCenterMissingHandled &&
    result.allOfficialVerificationFalse &&
    result.labelsDisclaimersPresent &&
    result.productionSwapUsed === false &&
    result.productionTablesQueried === false
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "P2.GEO-3D",
    status,
    adapterStatus: result.status,
    lifecycleState: result.lifecycleState,
    latestRun: result.latestRun,
    importRunId: result.importRunId,
    runPhase: result.runPhase,
    signalCount: result.signalCount,
    featureCount: result.featureCount,
    featureTypes: result.featureTypes,
    missingFeatureTypes: result.missingFeatureTypes,
    coverageMode: result.coverageMode,
    hasP2Geo3CRun,
    hasSettlement,
    hasMainRoad,
    hasIndustrial,
    waterMissingHandled,
    adminCenterMissingHandled,
    allOfficialVerificationFalse: result.allOfficialVerificationFalse,
    labelsDisclaimersPresent: result.labelsDisclaimersPresent,
    productionSwapUsed: result.productionSwapUsed,
    productionTablesQueried: result.productionTablesQueried,
    stagingTablesQueried: result.stagingTablesQueried,
    signals: result.signals,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3d-staged-osm-signal-adapter-results",
    payload,
    [
      "# P2.GEO-3D Staged OSM Signal Adapter Results",
      "",
      `- Status: ${status}`,
      `- Adapter status: ${result.status}`,
      `- Lifecycle state: ${result.lifecycleState}`,
      `- Run phase: ${result.runPhase ?? "n/a"}`,
      `- Import run id: ${result.importRunId ?? "n/a"}`,
      `- Feature count: ${result.featureCount}`,
      `- Signal count: ${result.signalCount}`,
      `- Feature types: ${result.featureTypes.join(", ")}`,
      `- Missing feature types: ${result.missingFeatureTypes.join(", ")}`,
      `- Coverage mode: ${result.coverageMode}`,
      `- Has settlement: ${hasSettlement}`,
      `- Has main road: ${hasMainRoad}`,
      `- Has industrial/OSB candidate: ${hasIndustrial}`,
      `- Water missing handled: ${waterMissingHandled}`,
      `- Admin center missing handled: ${adminCenterMissingHandled}`,
      `- officialVerification all false: ${result.allOfficialVerificationFalse}`,
      `- Labels/disclaimers present: ${result.labelsDisclaimersPresent}`,
      "- Production swap used: false",
      "- Production tables queried: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3d-staged-osm-signal-adapter-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3D",
    status: "FAIL",
    detail,
    productionSwapUsed: false,
    productionTablesQueried: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3d-staged-osm-signal-adapter-results",
    payload,
    `# P2.GEO-3D Staged OSM Signal Adapter Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3d-staged-osm-signal-adapter-results.json" }, null, 2));
  process.exitCode = 1;
});



