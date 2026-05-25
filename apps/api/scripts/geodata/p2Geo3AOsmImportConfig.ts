import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export type P2Geo3AStatus =
  | "CONFIG_REQUIRED"
  | "SOURCE_MISSING"
  | "SOURCE_VALIDATED"
  | "FUTURE_TOOLING_REQUIRED"
  | "SCOPE_BLOCKED"
  | "MODE_BLOCKED"
  | "DRY_RUN_PASS"
  | "FAIL";

export const allowedScopes = new Set(["KAYSERI_SAMPLE_ONLY", "SMALL_REGION_ONLY"]);
export const blockedScopes = new Set(["TURKEY_FULL", "WORLD_FULL", "PRODUCTION_FULL"]);

export const allowedModes = new Set(["VALIDATE_ONLY", "DRY_RUN"]);
export const blockedModes = new Set(["IMPORT_PRODUCTION", "SWAP_PRODUCTION", "SCHEDULED_IMPORT"]);

export function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

export function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

export function sha256File(filePath: string): string {
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

export function readOsmImportConfig() {
  const sourcePathRaw = process.env.GEODATA_OSM_SOURCE_PATH?.trim() || "";
  const sourcePath = sourcePathRaw ? path.resolve(sourcePathRaw) : null;
  const sourceExists = sourcePath ? fs.existsSync(sourcePath) : false;
  const scope = process.env.GEODATA_OSM_SCOPE?.trim() || "SMALL_REGION_ONLY";
  const mode = process.env.GEODATA_OSM_IMPORT_MODE?.trim() || "DRY_RUN";

  const scopeAllowed = allowedScopes.has(scope);
  const scopeBlocked = blockedScopes.has(scope);
  const modeAllowed = allowedModes.has(mode);
  const modeBlocked = blockedModes.has(mode);

  let status: P2Geo3AStatus = "SOURCE_VALIDATED";
  let blocker: string | null = null;

  if (!sourcePath) {
    status = "CONFIG_REQUIRED";
    blocker = "GEODATA_OSM_SOURCE_PATH is missing.";
  } else if (!sourceExists) {
    status = "SOURCE_MISSING";
    blocker = "Configured GEODATA_OSM_SOURCE_PATH does not exist.";
  } else if (scopeBlocked || !scopeAllowed) {
    status = "SCOPE_BLOCKED";
    blocker = `GEODATA_OSM_SCOPE is not allowed in P2.GEO-3A: ${scope}`;
  } else if (modeBlocked || !modeAllowed) {
    status = "MODE_BLOCKED";
    blocker = `GEODATA_OSM_IMPORT_MODE is not allowed in P2.GEO-3A: ${mode}`;
  }

  return {
    sourcePathConfigured: Boolean(sourcePath),
    sourcePath,
    sourceExists,
    scope,
    mode,
    scopeAllowed,
    scopeBlocked,
    modeAllowed,
    modeBlocked,
    status,
    blocker,
  };
}

export function safeConfigForProof(config: ReturnType<typeof readOsmImportConfig>) {
  return {
    sourcePathConfigured: config.sourcePathConfigured,
    sourceExists: config.sourceExists,
    scope: config.scope,
    mode: config.mode,
    scopeAllowed: config.scopeAllowed,
    scopeBlocked: config.scopeBlocked,
    modeAllowed: config.modeAllowed,
    modeBlocked: config.modeBlocked,
    status: config.status,
    blocker: config.blocker,
  };
}
