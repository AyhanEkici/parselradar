import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

type ValidationStatus =
  | "CONFIG_REQUIRED"
  | "SOURCE_MISSING"
  | "SOURCE_VALIDATED"
  | "FUTURE_TOOLING_REQUIRED"
  | "SCOPE_BLOCKED"
  | "MODE_BLOCKED"
  | "UNSUPPORTED_EXTENSION"
  | "FAIL";

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

function getExtension(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".osm.pbf")) return ".osm.pbf";
  return path.extname(lower);
}

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_SOURCE_PATH?.trim() || "";
  const scope = process.env.GEODATA_OSM_SCOPE?.trim() || "SMALL_REGION_ONLY";
  const mode = process.env.GEODATA_OSM_IMPORT_MODE?.trim() || "DRY_RUN";

  const allowedScopes = new Set(["KAYSERI_SAMPLE_ONLY", "SMALL_REGION_ONLY"]);
  const blockedScopes = new Set(["TURKEY_FULL", "WORLD_FULL", "PRODUCTION_FULL"]);

  const allowedModes = new Set(["VALIDATE_ONLY", "DRY_RUN"]);
  const blockedModes = new Set(["IMPORT_PRODUCTION", "SWAP_PRODUCTION", "SCHEDULED_IMPORT"]);

  let status: ValidationStatus = "SOURCE_VALIDATED";
  let blocker: string | null = null;

  if (!sourcePathRaw) {
    status = "CONFIG_REQUIRED";
    blocker = "GEODATA_OSM_SOURCE_PATH is missing.";
  }

  const sourcePath = sourcePathRaw ? path.resolve(sourcePathRaw) : null;
  const sourceExists = sourcePath ? fs.existsSync(sourcePath) : false;

  if (status === "SOURCE_VALIDATED" && !sourceExists) {
    status = "SOURCE_MISSING";
    blocker = "Configured GEODATA_OSM_SOURCE_PATH does not exist.";
  }

  if (status === "SOURCE_VALIDATED" && (blockedScopes.has(scope) || !allowedScopes.has(scope))) {
    status = "SCOPE_BLOCKED";
    blocker = `GEODATA_OSM_SCOPE is not allowed in P2.GEO-3A: ${scope}`;
  }

  if (status === "SOURCE_VALIDATED" && (blockedModes.has(mode) || !allowedModes.has(mode))) {
    status = "MODE_BLOCKED";
    blocker = `GEODATA_OSM_IMPORT_MODE is not allowed in P2.GEO-3A: ${mode}`;
  }

  const extension = sourcePath ? getExtension(sourcePath) : null;
  const supportedDryRun = extension ? [".geojson", ".json"].includes(extension) : false;
  const futureToolingRequired = extension ? [".osm.pbf", ".pbf", ".osm"].includes(extension) : false;
  const sizeBytes = sourceExists && sourcePath ? fs.statSync(sourcePath).size : null;
  const checksum = sourceExists && sourcePath ? sha256File(sourcePath) : null;

  if (status === "SOURCE_VALIDATED" && !supportedDryRun && futureToolingRequired) {
    status = "FUTURE_TOOLING_REQUIRED";
    blocker = `${extension} source recognized but P2.GEO-3A does not parse it yet. Use later osmium/osm2pgsql pipeline phase.`;
  }

  if (status === "SOURCE_VALIDATED" && !supportedDryRun && !futureToolingRequired) {
    status = "UNSUPPORTED_EXTENSION";
    blocker = `Unsupported source extension: ${extension ?? "none"}`;
  }

  const payload = {
    phase: "P2.GEO-3A",
    step: "validate-osm-source",
    status,
    sourcePathConfigured: Boolean(sourcePathRaw),
    sourceExists,
    scope,
    mode,
    scopeAllowed: allowedScopes.has(scope),
    scopeBlocked: blockedScopes.has(scope) || !allowedScopes.has(scope),
    modeAllowed: allowedModes.has(mode),
    modeBlocked: blockedModes.has(mode) || !allowedModes.has(mode),
    fileExtension: extension,
    sizeBytes,
    checksumVisible: Boolean(checksum),
    checksum,
    dryRunSupported: supportedDryRun,
    futureToolingRequired,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    schedulerAdded: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerification: false,
    blocker,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3a-osm-source-validation",
    payload,
    [
      "# P2.GEO-3A OSM Source Validation",
      "",
      `- Status: ${status}`,
      `- Source configured: ${Boolean(sourcePathRaw)}`,
      `- Source exists: ${sourceExists}`,
      `- Extension: ${extension ?? "n/a"}`,
      `- Size bytes: ${sizeBytes ?? "n/a"}`,
      `- Checksum visible: ${Boolean(checksum)}`,
      `- Dry-run supported: ${supportedDryRun}`,
      `- Future tooling required: ${futureToolingRequired}`,
      `- Blocker: ${blocker ?? "none"}`,
      "- Full Turkey import allowed: false",
      "- Production swap allowed: false",
      "- Official verification: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/p2-geo-3a-osm-source-validation.json" }, null, 2));

  if (status !== "SOURCE_VALIDATED") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-3A",
    step: "validate-osm-source",
    status: "FAIL",
    detail,
    fullTurkeyImportAllowed: false,
    productionSwapAllowed: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3a-osm-source-validation",
    payload,
    `# P2.GEO-3A OSM Source Validation\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3a-osm-source-validation.json" }, null, 2));
  process.exitCode = 1;
});
