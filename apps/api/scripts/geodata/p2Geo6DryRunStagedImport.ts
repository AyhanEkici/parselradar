import fs from "node:fs";
import path from "node:path";
import {
  readP2Geo6Config,
  safeConfigForProof,
  sha256File,
  writeProofPair,
} from "./p2Geo6StagedImportConfig";

async function main() {
  const config = readP2Geo6Config();

  if (config.status !== "SOURCE_VALIDATED" || !config.sourcePath) {
    const payload = {
      phase: "P2.GEO-6",
      step: "dry-run-staged-import",
      status: config.status,
      detail: config.blocker,
      ...safeConfigForProof(config),
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair(
      "proof/p2-geo-6-dry-run-results",
      payload,
      `# P2.GEO-6 Dry Run Results\n\n- Status: ${config.status}\n- Reason: ${config.blocker ?? "none"}\n- Production swap allowed: false\n`,
    );
    console.log(JSON.stringify({ status: config.status, proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
    return;
  }

  const ext = path.extname(config.sourcePath).toLowerCase();
  if (![".geojson", ".json"].includes(ext)) {
    const payload = {
      phase: "P2.GEO-6",
      step: "dry-run-staged-import",
      status: "SOURCE_UNSUPPORTED",
      detail: `Unsupported format for P2.GEO-6 dry-run: ${ext}`,
      ...safeConfigForProof(config),
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair(
      "proof/p2-geo-6-dry-run-results",
      payload,
      `# P2.GEO-6 Dry Run Results\n\n- Status: SOURCE_UNSUPPORTED\n- Reason: Unsupported format ${ext}\n`,
    );
    console.log(JSON.stringify({ status: "SOURCE_UNSUPPORTED", proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
    return;
  }

  const raw = fs.readFileSync(config.sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : Array.isArray(parsed) ? parsed : [];
  const featureCount = features.length;

  const payload = {
    phase: "P2.GEO-6",
    step: "dry-run-staged-import",
    status: "DRY_RUN_PASS",
    sourcePathConfigured: true,
    sourceExists: true,
    sourceExtension: ext,
    sourceChecksum: sha256File(config.sourcePath),
    featureCount,
    expectedTables: ["geo_import_runs", "geo_staging_features"],
    productionSwapAllowed: false,
    officialVerification: false,
    labelsRequired: ["PUBLIC_SOURCE_SIGNAL", "NEEDS_OFFICIAL_CONFIRMATION"],
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-6-dry-run-results",
    payload,
    [
      "# P2.GEO-6 Dry Run Results",
      "",
      "- Status: DRY_RUN_PASS",
      `- Feature count: ${featureCount}`,
      "- Production swap allowed: false",
      "- Official verification: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status: "DRY_RUN_PASS", proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
}

main().catch((error) => {
  const payload = {
    phase: "P2.GEO-6",
    step: "dry-run-staged-import",
    status: "FAIL",
    detail: error instanceof Error ? error.message : String(error),
    generatedAt: new Date().toISOString(),
  };
  writeProofPair(
    "proof/p2-geo-6-dry-run-results",
    payload,
    `# P2.GEO-6 Dry Run Results\n\n- Status: FAIL\n- Reason: ${payload.detail}\n`,
  );
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
  process.exitCode = 1;
});
