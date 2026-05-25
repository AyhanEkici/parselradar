import fs from "node:fs";
import path from "node:path";
import {
  readP2Geo6Config,
  safeConfigForProof,
  sha256File,
  writeProofPair,
} from "./p2Geo6StagedImportConfig";

type ProofStatus =
  | "CONFIG_REQUIRED"
  | "SOURCE_MISSING"
  | "SOURCE_UNSUPPORTED"
  | "DRY_RUN_PASS"
  | "FAIL";

function writeDryRunProof(payload: Record<string, unknown>, markdown: string): void {
  writeProofPair("proof/p2-geo-6-dry-run-results", payload, markdown);
}

async function main(): Promise<void> {
  const config = readP2Geo6Config();
  const safeConfig = safeConfigForProof(config);

  if (config.status !== "SOURCE_VALIDATED" || !config.sourcePath) {
    const status = config.status as ProofStatus;
    const payload = {
      phase: "P2.GEO-6",
      step: "dry-run-staged-import",
      generatedAt: new Date().toISOString(),
      ...safeConfig,
      status,
      detail: config.blocker,
      productionSwapAllowed: false,
      officialVerification: false,
    };

    writeDryRunProof(
      payload,
      [
        "# P2.GEO-6 Dry Run Results",
        "",
        `- Status: ${status}`,
        `- Reason: ${config.blocker ?? "none"}`,
        "- Production swap allowed: false",
        "- Official verification: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status, proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
    return;
  }

  const ext = path.extname(config.sourcePath).toLowerCase();

  if (![".geojson", ".json"].includes(ext)) {
    const payload = {
      phase: "P2.GEO-6",
      step: "dry-run-staged-import",
      generatedAt: new Date().toISOString(),
      ...safeConfig,
      status: "SOURCE_UNSUPPORTED",
      detail: `Unsupported format for P2.GEO-6 dry-run: ${ext}`,
      productionSwapAllowed: false,
      officialVerification: false,
    };

    writeDryRunProof(
      payload,
      [
        "# P2.GEO-6 Dry Run Results",
        "",
        "- Status: SOURCE_UNSUPPORTED",
        `- Reason: Unsupported format ${ext}`,
        "- Production swap allowed: false",
        "- Official verification: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status: "SOURCE_UNSUPPORTED", proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
    return;
  }

  const raw = fs.readFileSync(config.sourcePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : Array.isArray(parsed) ? parsed : [];
  const featureCount = features.length;

  const payload = {
    phase: "P2.GEO-6",
    step: "dry-run-staged-import",
    generatedAt: new Date().toISOString(),
    ...safeConfig,
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
  };

  writeDryRunProof(
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
  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-6",
    step: "dry-run-staged-import",
    status: "FAIL",
    detail: message,
    generatedAt: new Date().toISOString(),
  };

  writeDryRunProof(
    payload,
    `# P2.GEO-6 Dry Run Results\n\n- Status: FAIL\n- Reason: ${message}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-6-dry-run-results.json" }, null, 2));
  process.exitCode = 1;
});
