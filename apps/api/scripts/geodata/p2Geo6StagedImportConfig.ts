import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type P2Geo6Status =
  | "CONFIG_REQUIRED"
  | "SOURCE_MISSING"
  | "SOURCE_VALIDATED"
  | "SOURCE_UNSUPPORTED"
  | "STAGING_READY"
  | "DRY_RUN_PASS"
  | "STAGED_IMPORT_PASS"
  | "STAGED_IMPORT_FAIL"
  | "PRODUCTION_SWAP_BLOCKED"
  | "FAIL";

export type P2Geo6Config = {
  geodataDatabaseUrlPresent: boolean;
  sourcePath: string | null;
  sourcePathExists: boolean;
  importScope: string;
  importMode: string;
  allowedScope: boolean;
  allowedMode: boolean;
  status: P2Geo6Status;
  blocker: string | null;
};

export const allowedScopes = new Set(["KAYSERI_POC_ONLY", "SMALL_SAMPLE_ONLY"]);
export const allowedModes = new Set(["VALIDATE_ONLY", "DRY_RUN", "STAGED_ONLY"]);

export function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

export function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

export function sha256File(filePath: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

export function readP2Geo6Config(): P2Geo6Config {
  const sourcePathRaw = process.env.GEODATA_IMPORT_SOURCE_PATH?.trim() || "";
  const sourcePath = sourcePathRaw ? path.resolve(sourcePathRaw) : null;
  const sourcePathExists = sourcePath ? fs.existsSync(sourcePath) : false;
  const importScope = process.env.GEODATA_IMPORT_SCOPE?.trim() || "SMALL_SAMPLE_ONLY";
  const importMode = process.env.GEODATA_IMPORT_MODE?.trim() || "DRY_RUN";
  const allowedScope = allowedScopes.has(importScope);
  const allowedMode = allowedModes.has(importMode);
  const geodataDatabaseUrlPresent = Boolean(process.env.GEODATA_DATABASE_URL);

  if (!geodataDatabaseUrlPresent) {
    return {
      geodataDatabaseUrlPresent,
      sourcePath,
      sourcePathExists,
      importScope,
      importMode,
      allowedScope,
      allowedMode,
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_DATABASE_URL is missing.",
    };
  }

  if (!sourcePath) {
    return {
      geodataDatabaseUrlPresent,
      sourcePath,
      sourcePathExists,
      importScope,
      importMode,
      allowedScope,
      allowedMode,
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_IMPORT_SOURCE_PATH is missing.",
    };
  }

  if (!sourcePathExists) {
    return {
      geodataDatabaseUrlPresent,
      sourcePath,
      sourcePathExists,
      importScope,
      importMode,
      allowedScope,
      allowedMode,
      status: "SOURCE_MISSING",
      blocker: "Configured source path does not exist.",
    };
  }

  if (!allowedScope) {
    return {
      geodataDatabaseUrlPresent,
      sourcePath,
      sourcePathExists,
      importScope,
      importMode,
      allowedScope,
      allowedMode,
      status: "FAIL",
      blocker: "GEODATA_IMPORT_SCOPE is not allowed in P2.GEO-6.",
    };
  }

  if (!allowedMode) {
    return {
      geodataDatabaseUrlPresent,
      sourcePath,
      sourcePathExists,
      importScope,
      importMode,
      allowedScope,
      allowedMode,
      status: "FAIL",
      blocker: "GEODATA_IMPORT_MODE is not allowed in P2.GEO-6.",
    };
  }

  return {
    geodataDatabaseUrlPresent,
    sourcePath,
    sourcePathExists,
    importScope,
    importMode,
    allowedScope,
    allowedMode,
    status: "SOURCE_VALIDATED",
    blocker: null,
  };
}

export function safeConfigForProof(config: P2Geo6Config) {
  return {
    geodataDatabaseUrlPresent: config.geodataDatabaseUrlPresent,
    sourcePathConfigured: Boolean(config.sourcePath),
    sourcePathExists: config.sourcePathExists,
    importScope: config.importScope,
    importMode: config.importMode,
    allowedScope: config.allowedScope,
    allowedMode: config.allowedMode,
    status: config.status,
    blocker: config.blocker,
  };
}
