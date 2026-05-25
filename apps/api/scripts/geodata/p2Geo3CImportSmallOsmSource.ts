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

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_SOURCE_PATH?.trim() || "";
  const scope = process.env.GEODATA_OSM_SCOPE?.trim() || "SMALL_REGION_ONLY";
  const mode = process.env.GEODATA_OSM_IMPORT_MODE?.trim() || "STAGED_IMPORT";

  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-3C",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_DATABASE_URL is missing.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, "# P2.GEO-3C Import\n\n- Status: CONFIG_REQUIRED\n");
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (!sourcePathRaw || !fs.existsSync(sourcePathRaw)) {
    const payload = {
      phase: "P2.GEO-3C",
      status: "SOURCE_MISSING",
      blocker: "GEODATA_OSM_SOURCE_PATH missing or not found.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, "# P2.GEO-3C Import\n\n- Status: SOURCE_MISSING\n");
    console.log(JSON.stringify({ status: "SOURCE_MISSING", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (scope !== "SMALL_REGION_ONLY" || mode !== "STAGED_IMPORT") {
    const payload = {
      phase: "P2.GEO-3C",
      status: "SCOPE_OR_MODE_BLOCKED",
      scope,
      mode,
      blocker: "Only SMALL_REGION_ONLY + STAGED_IMPORT is allowed in P2.GEO-3C.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, "# P2.GEO-3C Import\n\n- Status: SCOPE_OR_MODE_BLOCKED\n");
    console.log(JSON.stringify({ status: "SCOPE_OR_MODE_BLOCKED", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(sourcePathRaw, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : [];

  if (features.length === 0) {
    const payload = {
      phase: "P2.GEO-3C",
      status: "SOURCE_EMPTY",
      blocker: "GeoJSON has zero features.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, "# P2.GEO-3C Import\n\n- Status: SOURCE_EMPTY\n");
    console.log(JSON.stringify({ status: "SOURCE_EMPTY", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const checksum = sha256File(sourcePathRaw);
  const sourceBasename = path.basename(sourcePathRaw);
  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  let importRunId: number | string | null = null;

  try {
    await client.connect();
    await client.query("BEGIN");

    const runResult = await client.query(
      `
      INSERT INTO public.geo_import_runs
        (phase, source_name, source_checksum, import_scope, import_mode, status, started_at, completed_at, notes)
      VALUES
        ($1, $2, $3, $4, $5, $6, now(), now(), $7)
      RETURNING id
      `,
      [
        "P2.GEO-3C",
        "OPENSTREETMAP_OVERPASS_SMALL_KAYSERI",
        checksum,
        scope,
        mode,
        "STAGED_IMPORT_PASS",
        `Small staged OSM-derived import from ${sourceBasename}; source file not committed.`,
      ],
    );

    importRunId = runResult.rows[0].id;

    let inserted = 0;
    const featureTypeCounts: Record<string, number> = {};

    for (const feature of features) {
      const properties = feature.properties ?? {};
      const geometry = feature.geometry;

      if (!geometry) {
        continue;
      }

      const featureType = String(properties.featureType ?? "UNKNOWN");
      const sourceLayer = String(properties.sourceLayer ?? "osm_overpass_small_kayseri");
      const sourceId = String(properties.sourceId ?? `${featureType}-${inserted}`);
      const name = String(properties.name ?? sourceId);
      const sourceLabel = String(properties.sourceLabel ?? "PUBLIC_SOURCE_SIGNAL");
      const officialVerification = false;

      const safeProperties = {
        ...properties,
        officialVerification: false,
        sourceLabel,
        sourceName: properties.sourceName ?? "OPENSTREETMAP_OVERPASS_SMALL_KAYSERI",
        sourceLicense: properties.sourceLicense ?? "ODbL/OpenStreetMap contributors",
        disclaimer:
          properties.disclaimer ??
          "OpenStreetMap-derived public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.",
      };

      await client.query(
        `
        WITH parsed AS (
          SELECT ST_SetSRID(ST_GeomFromGeoJSON($9), 4326) AS geom
        )
        INSERT INTO public.geo_staging_features
          (import_run_id, feature_type, source_layer, source_id, name, source_label, official_verification, properties, geom)
        SELECT
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb,
          CASE
            WHEN ST_IsValid(geom) THEN geom
            ELSE ST_MakeValid(geom)
          END
        FROM parsed
        `,
        [
          importRunId,
          featureType,
          sourceLayer,
          sourceId,
          name,
          sourceLabel,
          officialVerification,
          JSON.stringify(safeProperties),
          JSON.stringify(geometry),
        ],
      );

      inserted += 1;
      featureTypeCounts[featureType] = (featureTypeCounts[featureType] ?? 0) + 1;
    }

    await client.query("COMMIT");

    const payload = {
      phase: "P2.GEO-3C",
      status: "STAGED_IMPORT_PASS",
      importRunId,
      sourceBasename,
      sourceChecksum: checksum,
      sourceFeatureCount: features.length,
      insertedFeatureCount: inserted,
      featureTypeCounts,
      scope,
      mode,
      sourceFileCommitted: false,
      rawSourcePathCommitted: false,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      productionTablesWritten: false,
      stagingTablesWritten: true,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-3c-small-staged-import-results",
      payload,
      [
        "# P2.GEO-3C Small Staged Import Results",
        "",
        "- Status: STAGED_IMPORT_PASS",
        `- Import run id: ${importRunId}`,
        `- Source feature count: ${features.length}`,
        `- Inserted feature count: ${inserted}`,
        "- Source file committed: false",
        "- Production swap allowed: false",
        "- Official verification: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status: "STAGED_IMPORT_PASS", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);

    const payload = {
      phase: "P2.GEO-3C",
      status: "FAIL",
      detail,
      importRunId,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, `# P2.GEO-3C Import\n\n- Status: FAIL\n- Detail: ${detail}\n`);
    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3C",
    status: "FAIL",
    detail,
    productionSwapAllowed: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, `# P2.GEO-3C Import\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
  process.exitCode = 1;
});
