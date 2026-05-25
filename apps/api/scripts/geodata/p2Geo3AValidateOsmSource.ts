import fs from "node:fs";
import path from "node:path";
import {
  readOsmImportConfig,
  safeConfigForProof,
  sha256File,
  writeProofPair,
} from "./p2Geo3AOsmImportConfig";

const supportedDryRunExtensions = new Set([".geojson", ".json"]);
const futureToolingExtensions = new Set([".osm.pbf", ".pbf", ".osm"]);

function getExtension(filePath: string | null): string | null {
  if (!filePath) return null;
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".osm.pbf")) return ".osm.pbf";
  return path.extname(lower);
}

async function main(): Promise<void> {
  const config = readOsmImportConfig();
  const ext = getExtension(config.sourcePath);
  const sizeBytes = config.sourceExists && config.sourcePath ? fs.statSync(config.sourcePath).size : null;
  const checksum = config.sourceExists && config.sourcePath ? sha256File(config.sourcePath) : null;

  let status = config.status;
  let blocker = config.blocker;
  let dryRunSupported = false;

  if (config.status === "SOURCE_VALIDATED") {
    if (ext && supportedDryRunExtensions.has(ext)) {
      status = "SOURCE_VALIDATED";
      dryRunSupported = true;
    } else if (ext && futureToolingExtensions.has(ext)) {
      status = "FUTURE_TOOLING_REQUIRED";
      blocker = `${ext} source recognized but P2.GEO-3A does not parse it yet. Use later osmium/osm2pgsql pipeline phase.`;
    } else {
      status = "FAIL";
      blocker = `Unsupported source extension: ${ext ?? "none"}`;
    }
  }

  const payload = {
    phase: "P2.GEO-3A",
    step: "validate-osm-source",
    generatedAt: new Date().toISOString(),
    ...safeConfigForProof(config),
    status,
    fileExtension: ext,
    sizeBytes,
    checksumVisible: Boolean(checksum),
    checksum,
    dryRunSupported,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    schedulerAdded: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerification: false,
    blocker,
  };

  writeProofPair(
    "proof/p2-geo-3a-osm-source-validation",
    payload,
    [
      "# P2.GEO-3A OSM Source Validation",
      "",
      `- Status: ${status}`,
      `- Source configured: ${config.sourcePathConfigured}`,
      `- Source exists: ${config.sourceExists}`,
      `- Extension: ${ext ?? "n/a"}`,
      `- Size bytes: ${sizeBytes ?? "n/a"}`,
      `- Checksum visible: ${Boolean(checksum)}`,
      `- Dry-run supported: ${dryRunSupported}`,
      `- Blocker: ${blocker ?? "none"}`,
      "- Full Turkey import allowed: false",
      "- Production swap allowed: false",
      "- Official verification: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3a-osm-source-validation.json" }, null, 2));
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3A",
    step: "validate-osm-source",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
    productionSwapAllowed: false,
    officialVerification: false,
  };

  writeProofPair("proof/p2-geo-3a-osm-source-validation", payload, `# P2.GEO-3A OSM Source Validation\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3a-osm-source-validation.json" }, null, 2));
  process.exitCode = 1;
});
