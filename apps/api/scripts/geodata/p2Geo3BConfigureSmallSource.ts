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

function getExtension(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".osm.pbf")) return ".osm.pbf";
  return path.extname(lower);
}

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_SOURCE_PATH?.trim() || "";
  const scope = process.env.GEODATA_OSM_SCOPE?.trim() || "SMALL_REGION_ONLY";
  const mode = process.env.GEODATA_OSM_IMPORT_MODE?.trim() || "VALIDATE_ONLY";

  const allowedScopes = new Set(["KAYSERI_SAMPLE_ONLY", "SMALL_REGION_ONLY"]);
  const blockedScopes = new Set(["TURKEY_FULL", "WORLD_FULL", "PRODUCTION_FULL"]);
  const allowedModes = new Set(["VALIDATE_ONLY", "DRY_RUN"]);
  const blockedModes = new Set(["IMPORT_PRODUCTION", "SWAP_PRODUCTION", "SCHEDULED_IMPORT"]);

  if (!sourcePathRaw) {
    const payload = {
      phase: "P2.GEO-3B",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_OSM_SOURCE_PATH is missing.",
      sourcePathConfigured: false,
      productionSwapAllowed: false,
      fullTurkeyImportAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3b-small-source-config-results", payload, "# P2.GEO-3B Small Source Config\n\n- Status: CONFIG_REQUIRED\n");
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3b-small-source-config-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const sourcePath = path.resolve(sourcePathRaw);

  if (!fs.existsSync(sourcePath)) {
    const payload = {
      phase: "P2.GEO-3B",
      status: "SOURCE_MISSING",
      blocker: "Configured source path does not exist.",
      sourcePathConfigured: true,
      sourcePathHash: sha256Text(sourcePath),
      sourceBasename: path.basename(sourcePath),
      productionSwapAllowed: false,
      fullTurkeyImportAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3b-small-source-config-results", payload, "# P2.GEO-3B Small Source Config\n\n- Status: SOURCE_MISSING\n");
    console.log(JSON.stringify({ status: "SOURCE_MISSING", proof: "proof/p2-geo-3b-small-source-config-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const ext = getExtension(sourcePath);
  const supportedDryRun = [".geojson", ".json"].includes(ext);
  const futureToolingRequired = [".osm.pbf", ".pbf", ".osm"].includes(ext);
  const sizeBytes = fs.statSync(sourcePath).size;
  const checksum = sha256File(sourcePath);
  const sourcePathHash = sha256Text(sourcePath);

  const scopeAllowed = allowedScopes.has(scope);
  const scopeBlocked = blockedScopes.has(scope) || !scopeAllowed;
  const modeAllowed = allowedModes.has(mode);
  const modeBlocked = blockedModes.has(mode) || !modeAllowed;

  let status = "SOURCE_CONFIGURED";
  let blocker: string | null = null;

  if (scopeBlocked) {
    status = "SCOPE_BLOCKED";
    blocker = `Scope is not allowed for P2.GEO-3B: ${scope}`;
  } else if (modeBlocked) {
    status = "MODE_BLOCKED";
    blocker = `Mode is not allowed for P2.GEO-3B: ${mode}`;
  } else if (!supportedDryRun && !futureToolingRequired) {
    status = "UNSUPPORTED_EXTENSION";
    blocker = `Unsupported extension: ${ext}`;
  }

  const payload = {
    phase: "P2.GEO-3B",
    status,
    sourcePathConfigured: true,
    sourceExists: true,
    sourceBasename: path.basename(sourcePath),
    sourcePathHash,
    sourceExtension: ext,
    sizeBytes,
    checksum,
    checksumVisible: true,
    scope,
    mode,
    scopeAllowed,
    modeAllowed,
    supportedDryRun,
    futureToolingRequired,
    blocker,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    schedulerAdded: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3b-small-source-config-results",
    payload,
    [
      "# P2.GEO-3B Small Source Config",
      "",
      `- Status: ${status}`,
      `- Source basename: ${path.basename(sourcePath)}`,
      `- Extension: ${ext}`,
      `- Size bytes: ${sizeBytes}`,
      "- Checksum visible: true",
      `- Scope: ${scope}`,
      `- Mode: ${mode}`,
      `- Supported dry-run: ${supportedDryRun}`,
      `- Future tooling required: ${futureToolingRequired}`,
      `- Blocker: ${blocker ?? "none"}`,
      "- Full Turkey import allowed: false",
      "- Production swap allowed: false",
      "- Official verification: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3b-small-source-config-results.json" }, null, 2));

  if (status !== "SOURCE_CONFIGURED") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3B",
    status: "FAIL",
    detail,
    productionSwapAllowed: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair("proof/p2-geo-3b-small-source-config-results", payload, `# P2.GEO-3B Small Source Config\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3b-small-source-config-results.json" }, null, 2));
  process.exitCode = 1;
});
