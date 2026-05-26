import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function sha256File(filePath: string): string {
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isSupportedGeometryType(value: unknown): boolean {
  return value === "Point" || value === "LineString";
}

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_CONTROLLED_EXPANDED_SOURCE_PATH?.trim() || "";

  if (!sourcePathRaw) {
    const payload = {
      phase: "P2.GEO-3G",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_OSM_CONTROLLED_EXPANDED_SOURCE_PATH is missing.",
      dbImportExecuted: false,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      sourceFileCommitted: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3g-controlled-source-validation-results", payload, "# P2.GEO-3G Controlled Source Validation\n\n- Status: CONFIG_REQUIRED\n");
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3g-controlled-source-validation-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(sourcePathRaw);

  if (!fs.existsSync(sourcePath)) {
    const payload = {
      phase: "P2.GEO-3G",
      status: "SOURCE_MISSING",
      sourcePathHash: sha256Text(sourcePath),
      blocker: "Controlled expanded source file does not exist.",
      dbImportExecuted: false,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      sourceFileCommitted: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3g-controlled-source-validation-results", payload, "# P2.GEO-3G Controlled Source Validation\n\n- Status: SOURCE_MISSING\n");
    console.log(JSON.stringify({ status: "SOURCE_MISSING", proof: "proof/p2-geo-3g-controlled-source-validation-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : [];

  const featureTypeCounts: Record<string, number> = {};
  const geometryTypeCounts: Record<string, number> = {};
  let officialFalseCount = 0;
  let publicSourceLabelCount = 0;
  let disclaimerCount = 0;
  let unsupportedGeometryCount = 0;

  for (const feature of features) {
    const properties = feature.properties ?? {};
    const geometry = feature.geometry ?? {};
    const featureType = String(properties.featureType ?? "UNKNOWN");
    const geometryType = String(geometry.type ?? "UNKNOWN");

    featureTypeCounts[featureType] = (featureTypeCounts[featureType] ?? 0) + 1;
    geometryTypeCounts[geometryType] = (geometryTypeCounts[geometryType] ?? 0) + 1;

    if (properties.officialVerification === false) officialFalseCount += 1;
    if (properties.sourceLabel === "PUBLIC_SOURCE_SIGNAL") publicSourceLabelCount += 1;
    if (String(properties.disclaimer ?? "").includes("Not official tapu")) disclaimerCount += 1;
    if (!isSupportedGeometryType(geometryType)) unsupportedGeometryCount += 1;
  }

  const bbox = Array.isArray(parsed.bbox) ? parsed.bbox.map(Number) : [];
  const bboxValid =
    bbox.length === 4 &&
    bbox[0] >= 35.0 &&
    bbox[2] <= 36.1 &&
    bbox[1] >= 38.3 &&
    bbox[3] <= 39.1;

  const featureCount = features.length;
  const expandedBeyondTinySample = featureCount > 150;
  const hasSettlement = Boolean(featureTypeCounts.SETTLEMENT);
  const hasMainRoad = Boolean(featureTypeCounts.MAIN_ROAD);
  const hasIndustrial = Boolean(featureTypeCounts.INDUSTRIAL_OSB_CANDIDATE);
  const hasOptionalWaterOrRail = Boolean(featureTypeCounts.WATER_FEATURE || featureTypeCounts.RAILWAY_SIGNAL);

  const status =
    featureCount > 150 &&
    expandedBeyondTinySample &&
    hasSettlement &&
    hasMainRoad &&
    hasIndustrial &&
    officialFalseCount === featureCount &&
    publicSourceLabelCount === featureCount &&
    disclaimerCount === featureCount &&
    unsupportedGeometryCount === 0 &&
    bboxValid &&
    parsed.scope === "CONTROLLED_KAYSERI_AREA_ONLY" &&
    parsed.fullTurkeyImportAllowed === false &&
    parsed.productionSwapAllowed === false &&
    parsed.officialVerification === false
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "P2.GEO-3G",
    status,
    sourceBasename: path.basename(sourcePath),
    sourcePathHash: sha256Text(sourcePath),
    sourceChecksum: sha256File(sourcePath),
    sourceChecksumVisible: true,
    sourceSizeBytes: fs.statSync(sourcePath).size,
    sourceOutsideRepo: !sourcePath.includes(`${path.resolve(".")}\\`),
    featureCount,
    expandedBeyondTinySample,
    featureTypeCounts,
    geometryTypeCounts,
    hasSettlement,
    hasMainRoad,
    hasIndustrial,
    hasOptionalWaterOrRail,
    officialFalseCount,
    publicSourceLabelCount,
    disclaimerCount,
    unsupportedGeometryCount,
    bbox,
    bboxValid,
    scope: parsed.scope,
    dbImportExecuted: false,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    sourceFileCommitted: false,
    connectorActivated: false,
    scrapingAdded: false,
    schedulerAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3g-controlled-source-validation-results",
    payload,
    [
      "# P2.GEO-3G Controlled Source Validation Results",
      "",
      `- Status: ${status}`,
      `- Source basename: ${path.basename(sourcePath)}`,
      `- Feature count: ${featureCount}`,
      `- Expanded beyond tiny sample: ${expandedBeyondTinySample}`,
      `- Feature types: ${Object.entries(featureTypeCounts).map(([key, value]) => `${key}:${value}`).join(", ")}`,
      `- Geometry types: ${Object.entries(geometryTypeCounts).map(([key, value]) => `${key}:${value}`).join(", ")}`,
      `- Has settlement: ${hasSettlement}`,
      `- Has main road: ${hasMainRoad}`,
      `- Has industrial/OSB candidate: ${hasIndustrial}`,
      `- BBOX valid: ${bboxValid}`,
      "- DB import executed: false",
      "- Full Turkey import allowed: false",
      "- Production swap allowed: false",
      "- Source file committed: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3g-controlled-source-validation-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-3G",
    status: "FAIL",
    detail,
    dbImportExecuted: false,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    sourceFileCommitted: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3g-controlled-source-validation-results",
    payload,
    `# P2.GEO-3G Controlled Source Validation Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3g-controlled-source-validation-results.json" }, null, 2));
  process.exitCode = 1;
});
