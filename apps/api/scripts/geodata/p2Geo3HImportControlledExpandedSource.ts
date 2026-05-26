import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

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

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPosition(value: unknown): value is number[] {
  return Array.isArray(value) && value.length >= 2 && isNumber(value[0]) && isNumber(value[1]);
}

function isLineStringCoordinates(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length >= 2 && value.every(isPosition);
}

function normalizeGeometry(geometry: unknown): GeoJsonGeometry | null {
  if (!geometry || typeof geometry !== "object") return null;

  const g = geometry as GeoJsonGeometry;
  const type = String(g.type || "");
  const coordinates = g.coordinates;

  if (type === "Point" && isPosition(coordinates)) {
    return {
      type: "Point",
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
    };
  }

  if (type === "LineString" && isLineStringCoordinates(coordinates)) {
    return {
      type: "LineString",
      coordinates: coordinates.map((position) => [Number(position[0]), Number(position[1])]),
    };
  }

  return null;
}

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_CONTROLLED_EXPANDED_SOURCE_PATH?.trim() || "";
  const logicalScope = process.env.GEODATA_OSM_SCOPE?.trim() || "CONTROLLED_KAYSERI_AREA_ONLY";
  const dbScope = process.env.GEODATA_OSM_DB_SCOPE?.trim() || "KAYSERI_POC_ONLY";
  const dbImportMode = process.env.GEODATA_OSM_DB_IMPORT_MODE?.trim() || "DRY_RUN";

  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-3H",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_DATABASE_URL is missing.",
      stagingTablesWritten: false,
      productionTablesWritten: false,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, "# P2.GEO-3H Import\n\n- Status: CONFIG_REQUIRED\n");
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (!sourcePathRaw || !fs.existsSync(sourcePathRaw)) {
    const payload = {
      phase: "P2.GEO-3H",
      status: "SOURCE_MISSING",
      blocker: "GEODATA_OSM_CONTROLLED_EXPANDED_SOURCE_PATH missing or not found.",
      stagingTablesWritten: false,
      productionTablesWritten: false,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, "# P2.GEO-3H Import\n\n- Status: SOURCE_MISSING\n");
    console.log(JSON.stringify({ status: "SOURCE_MISSING", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (logicalScope !== "CONTROLLED_KAYSERI_AREA_ONLY") {
    const payload = {
      phase: "P2.GEO-3H",
      status: "SCOPE_BLOCKED",
      logicalScope,
      blocker: "Only CONTROLLED_KAYSERI_AREA_ONLY is allowed in P2.GEO-3H.",
      stagingTablesWritten: false,
      productionTablesWritten: false,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, "# P2.GEO-3H Import\n\n- Status: SCOPE_BLOCKED\n");
    console.log(JSON.stringify({ status: "SCOPE_BLOCKED", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(sourcePathRaw, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed.features) ? parsed.features : [];

  if (features.length <= 150) {
    const payload = {
      phase: "P2.GEO-3H",
      status: "SOURCE_TOO_SMALL",
      sourceFeatureCount: features.length,
      blocker: "Controlled expanded source must be larger than the tiny sample.",
      stagingTablesWritten: false,
      productionTablesWritten: false,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, "# P2.GEO-3H Import\n\n- Status: SOURCE_TOO_SMALL\n");
    console.log(JSON.stringify({ status: "SOURCE_TOO_SMALL", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
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
        "P2.GEO-3H",
        "OPENSTREETMAP_OVERPASS_CONTROLLED_EXPANDED_KAYSERI",
        checksum,
        dbScope,
        dbImportMode,
        "STAGED_IMPORT_PASS",
        `Controlled expanded Kayseri OSM-derived staged import from ${sourceBasename}; logicalScope=${logicalScope}; source file not committed.`,
      ],
    );

    importRunId = runResult.rows[0].id;

    let inserted = 0;
    let skipped = 0;
    const skippedReasons: Record<string, number> = {};
    const featureTypeCounts: Record<string, number> = {};

    for (const feature of features) {
      const properties = feature.properties ?? {};
      const normalizedGeometry = normalizeGeometry(feature.geometry);

      if (!normalizedGeometry) {
        skipped += 1;
        skippedReasons.UNSUPPORTED_OR_MALFORMED_GEOMETRY = (skippedReasons.UNSUPPORTED_OR_MALFORMED_GEOMETRY ?? 0) + 1;
        continue;
      }

      const featureType = String(properties.featureType ?? "UNKNOWN");
      const sourceLayer = String(properties.sourceLayer ?? "osm_overpass_controlled_expanded_kayseri");
      const sourceId = String(properties.sourceId ?? `${featureType}-${inserted}`);
      const name = String(properties.name ?? sourceId);
      const sourceLabel = "PUBLIC_SOURCE_SIGNAL";

      const safeProperties = {
        ...properties,
        officialVerification: false,
        sourceLabel,
        sourceName: properties.sourceName ?? "OPENSTREETMAP_OVERPASS_CONTROLLED_EXPANDED_KAYSERI",
        sourceLicense: properties.sourceLicense ?? "ODbL/OpenStreetMap contributors",
        logicalScope,
        dbScope,
        dbImportMode,
        normalizedGeometryType: normalizedGeometry.type,
        disclaimer:
          properties.disclaimer ??
          "OpenStreetMap-derived public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.",
      };

      const insertResult = await client.query(
        `
        WITH parsed AS (
          SELECT ST_SetSRID(ST_GeomFromGeoJSON($9), 4326) AS geom
        ),
        safe AS (
          SELECT
            CASE
              WHEN ST_IsValid(geom) THEN geom
              ELSE ST_MakeValid(geom)
            END AS geom
          FROM parsed
        )
        INSERT INTO public.geo_staging_features
          (import_run_id, feature_type, source_layer, source_id, name, source_label, official_verification, properties, geom)
        SELECT
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb, geom
        FROM safe
        WHERE geom IS NOT NULL
        RETURNING id
        `,
        [
          importRunId,
          featureType,
          sourceLayer,
          sourceId,
          name,
          sourceLabel,
          false,
          JSON.stringify(safeProperties),
          JSON.stringify(normalizedGeometry),
        ],
      );

      if ((insertResult.rowCount ?? 0) > 0) {
        inserted += 1;
        featureTypeCounts[featureType] = (featureTypeCounts[featureType] ?? 0) + 1;
      } else {
        skipped += 1;
        skippedReasons.DB_RETURNED_ZERO_ROWS = (skippedReasons.DB_RETURNED_ZERO_ROWS ?? 0) + 1;
      }
    }

    if (inserted <= 150) {
      throw new Error(`Expanded staged import inserted too few features: ${inserted}`);
    }

    await client.query("COMMIT");

    const payload = {
      phase: "P2.GEO-3H",
      status: "STAGED_IMPORT_PASS",
      importRunId,
      sourceBasename,
      sourceChecksum: checksum,
      logicalScope,
      dbScope,
      dbImportMode,
      sourceFeatureCount: features.length,
      insertedFeatureCount: inserted,
      skippedFeatureCount: skipped,
      skippedReasons,
      featureTypeCounts,
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
      "proof/p2-geo-3h-expanded-staged-import-results",
      payload,
      [
        "# P2.GEO-3H Expanded Staged Import Results",
        "",
        "- Status: STAGED_IMPORT_PASS",
        `- Import run id: ${importRunId}`,
        `- Source feature count: ${features.length}`,
        `- Inserted feature count: ${inserted}`,
        `- Skipped feature count: ${skipped}`,
        `- Logical scope: ${logicalScope}`,
        `- DB scope: ${dbScope}`,
        `- DB import mode: ${dbImportMode}`,
        "- Source file committed: false",
        "- Production swap allowed: false",
        "- Official verification: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status: "STAGED_IMPORT_PASS", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);

    const payload = {
      phase: "P2.GEO-3H",
      status: "FAIL",
      detail,
      importRunId,
      logicalScope,
      dbScope,
      dbImportMode,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, `# P2.GEO-3H Import\n\n- Status: FAIL\n- Detail: ${detail}\n`);
    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-3H",
    status: "FAIL",
    detail,
    productionSwapAllowed: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair("proof/p2-geo-3h-expanded-staged-import-results", payload, `# P2.GEO-3H Import\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3h-expanded-staged-import-results.json" }, null, 2));
  process.exitCode = 1;
});
