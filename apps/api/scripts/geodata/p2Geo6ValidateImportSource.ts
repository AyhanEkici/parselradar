import fs from "node:fs";
import path from "node:path";
import {
  readP2Geo6Config,
  safeConfigForProof,
  sha256File,
  writeProofPair,
} from "./p2Geo6StagedImportConfig";

const allowedExtensions = new Set([".geojson", ".json"]);
const documentedFutureExtensions = new Set([".gpkg", ".osm.pbf"]);

async function main() {
  const config = readP2Geo6Config();
  const ext = config.sourcePath ? path.extname(config.sourcePath).toLowerCase() : "";
  const exists = Boolean(config.sourcePath && fs.existsSync(config.sourcePath));
  const sizeBytes = exists && config.sourcePath ? fs.statSync(config.sourcePath).size : null;
  const checksum = exists && config.sourcePath ? sha256File(config.sourcePath) : null;

  let status = config.status;
  let blocker = config.blocker;
  let importAllowed = false;

  if (config.status === "SOURCE_VALIDATED") {
    if (allowedExtensions.has(ext)) {
      status = "SOURCE_VALIDATED";
      importAllowed = true;
      blocker = null;
    } else if (documentedFutureExtensions.has(ext)) {
      status = "SOURCE_UNSUPPORTED";
      blocker = `${ext} is documented for future support but not supported by P2.GEO-6 scripts.`;
    } else {
      status = "SOURCE_UNSUPPORTED";
      blocker = `Unsupported source extension: ${ext || "none"}`;
    }
  }

  const payload = {
    phase: "P2.GEO-6",
    step: "validate-source",
    generatedAt: new Date().toISOString(),
    ...safeConfigForProof(config),
    status,
    sourceExists: exists,
    fileExtension: ext || null,
    sizeBytes,
    checksum,
    importAllowed,
    blocker,
    productionSwapAllowed: false,
    officialVerification: false,
  };

  const md = [
    "# P2.GEO-6 Source Validation",
    "",
    `- Status: ${status}`,
    `- Source path configured: ${Boolean(config.sourcePath)}`,
    `- Source exists: ${exists}`,
    `- Extension: ${ext || "n/a"}`,
    `- Size bytes: ${sizeBytes ?? "n/a"}`,
    `- Checksum calculated: ${Boolean(checksum)}`,
    `- Import allowed: ${importAllowed}`,
    `- Blocker: ${blocker ?? "none"}`,
    "- Production swap allowed: false",
    "- Official verification: false",
    "",
  ].join("\n");

  writeProofPair("proof/p2-geo-6-source-validation", payload, md);
  console.log(JSON.stringify({ status, proof: "proof/p2-geo-6-source-validation.json" }, null, 2));
}

main().catch((error) => {
  const payload = {
    phase: "P2.GEO-6",
    step: "validate-source",
    status: "FAIL",
    message: error instanceof Error ? error.message : String(error),
    generatedAt: new Date().toISOString(),
  };
  writeProofPair(
    "proof/p2-geo-6-source-validation",
    payload,
    `# P2.GEO-6 Source Validation\n\n- Status: FAIL\n- Reason: ${payload.message}\n`,
  );
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-6-source-validation.json" }, null, 2));
  process.exitCode = 1;
});
