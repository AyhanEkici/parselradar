import fs from "node:fs";
import path from "node:path";
import {
  readOsmImportConfig,
  safeConfigForProof,
  sha256File,
  writeProofPair,
} from "./p2Geo3AOsmImportConfig";

function getExtension(filePath: string | null): string | null {
  if (!filePath) return null;
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".osm.pbf")) return ".osm.pbf";
  return path.extname(lower);
}

async function main(): Promise<void> {
  const config = readOsmImportConfig();
  const ext = getExtension(config.sourcePath);

  if (config.status !== "SOURCE_VALIDATED" || !config.sourcePath) {
    const payload = {
      phase: "P2.GEO-3A",
      step: "small-region-dry-run",
      generatedAt: new Date().toISOString(),
      ...safeConfigForProof(config),
      status: config.status,
      dryRunPass: false,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      schedulerAdded: false,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerification: false,
      blocker: config.blocker,
    };

    writeProofPair(
      "proof/p2-geo-3a-small-region-dry-run",
      payload,
      [
        "# P2.GEO-3A Small Region Dry Run",
        "",
        `- Status: ${config.status}`,
        `- Blocker: ${config.blocker ?? "none"}`,
        "- Dry-run pass: false",
        "- Full Turkey import allowed: false",
        "- Production swap allowed: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status: config.status, proof: "proof/p2-geo-3a-small-region-dry-run.json" }, null, 2));
    return;
  }

  if (![".geojson", ".json"].includes(ext ?? "")) {
    const payload = {
      phase: "P2.GEO-3A",
      step: "small-region-dry-run",
      generatedAt: new Date().toISOString(),
      ...safeConfigForProof(config),
      status: "FUTURE_TOOLING_REQUIRED",
      dryRunPass: false,
      fileExtension: ext,
      blocker: `${ext} requires a later osmium/osm2pgsql pipeline phase.`,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      schedulerAdded: false,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerification: false,
    };

    writeProofPair("proof/p2-geo-3a-small-region-dry-run", payload, `# P2.GEO-3A Small Region Dry Run\n\n- Status: FUTURE_TOOLING_REQUIRED\n- Extension: ${ext}\n`);
    console.log(JSON.stringify({ status: "FUTURE_TOOLING_REQUIRED", proof: "proof/p2-geo-3a-small-region-dry-run.json" }, null, 2));
    return;
  }

  const raw = fs.readFileSync(config.sourcePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : Array.isArray(parsed) ? parsed : [];
  const featureTypes = [...new Set(features.map((feature: any) => String(feature?.properties?.featureType ?? feature?.geometry?.type ?? "UNKNOWN")))].sort();

  const payload = {
    phase: "P2.GEO-3A",
    step: "small-region-dry-run",
    generatedAt: new Date().toISOString(),
    ...safeConfigForProof(config),
    status: "DRY_RUN_PASS",
    dryRunPass: true,
    fileExtension: ext,
    sourceChecksum: sha256File(config.sourcePath),
    featureCount: features.length,
    featureTypes,
    plannedTables: ["geo_import_runs", "geo_staging_features"],
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    schedulerAdded: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerification: false,
  };

  writeProofPair(
    "proof/p2-geo-3a-small-region-dry-run",
    payload,
    [
      "# P2.GEO-3A Small Region Dry Run",
      "",
      "- Status: DRY_RUN_PASS",
      `- Feature count: ${features.length}`,
      `- Feature types: ${featureTypes.join(", ")}`,
      "- Full Turkey import allowed: false",
      "- Production swap allowed: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status: "DRY_RUN_PASS", proof: "proof/p2-geo-3a-small-region-dry-run.json" }, null, 2));
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3A",
    step: "small-region-dry-run",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
    productionSwapAllowed: false,
    officialVerification: false,
  };

  writeProofPair("proof/p2-geo-3a-small-region-dry-run", payload, `# P2.GEO-3A Small Region Dry Run\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3a-small-region-dry-run.json" }, null, 2));
  process.exitCode = 1;
});
