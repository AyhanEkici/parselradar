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

function isPolygonCoordinates(value: unknown): value is number[][][] {
  return Array.isArray(value) && value.length >= 1 && value.every(isLineStringCoordinates);
}

function closeRing(ring: number[][]): number[][] {
  if (ring.length === 0) return ring;

  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] === last[0] && first[1] === last[1]) {
    return ring;
  }

  return [...ring, first];
}

function normalizeGeometry(geometry: unknown): GeoJsonGeometry | null {
  if (!geometry || typeof geometry !== "object") {
    return null;
  }

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

  if (type === "Polygon") {
    if (isPolygonCoordinates(coordinates)) {
      return {
        type: "Polygon",
        coordinates: coordinates.map((ring) =>
          closeRing(ring.map((position) => [Number(position[0]), Number(position[1])])),
        ),
      };
    }

    // Repair common malformed polygon: coordinates were written as [[lon,lat], ...]
    // instead of [[[lon,lat], ...]].
    if (isLineStringCoordinates(coordinates)) {
      const ring = closeRing(coordinates.map((position) => [Number(position[0]), Number(position[1])]));

      if (ring.length >= 4) {
        return {
          type: "Polygon",
          coordinates: [ring],
        };
      }
    }
  }

  return null;
}

async function main(): Promise<void> {
  const sourcePathRaw = process.env.GEODATA_OSM_SOURCE_PATH?.trim() || "";
  const logicalScope = process.env.GEODATA_OSM_SCOPE?.trim() || "SMALL_REGION_ONLY";
  const dbScope = process.env.GEODATA_OSM_DB_SCOPE?.trim() || "KAYSERI_POC_ONLY";
  const dbImportMode = process.env.GEODATA_OSM_DB_IMPORT_MODE?.trim() || "DRY_RUN";

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

  if (logicalScope !== "SMALL_REGION_ONLY") {
    const payload = {
      phase: "P2.GEO-3C",
      status: "SCOPE_BLOCKED",
      logicalScope,
      blocker: "Only SMALL_REGION_ONLY is allowed as logical source scope in P2.GEO-3C.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3c-small-staged-import-results", payload, "# P2.GEO-3C Import\n\n- Status: SCOPE_BLOCKED\n");
    console.log(JSON.stringify({ status: "SCOPE_BLOCKED", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
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
        dbScope,
        dbImportMode,
        "STAGED_IMPORT_PASS",
        `Small staged OSM-derived import from ${sourceBasename}; logicalScope=${logicalScope}; source file not committed.`,
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
      const sourceLayer = String(properties.sourceLayer ?? "osm_overpass_small_kayseri");
      const sourceId = String(properties.sourceId ?? `${featureType}-${inserted}`);
      const name = String(properties.name ?? sourceId);
      const sourceLabel = "PUBLIC_SOURCE_SIGNAL";

      const safeProperties = {
        ...properties,
        officialVerification: false,
        sourceLabel,
        sourceName: properties.sourceName ?? "OPENSTREETMAP_OVERPASS_SMALL_KAYSERI",
        sourceLicense: properties.sourceLicense ?? "ODbL/OpenStreetMap contributors",
        logicalScope,
        dbScope,
        dbImportMode,
        normalizedGeometryType: normalizedGeometry.type,
        disclaimer:
          properties.disclaimer ??
          "OpenStreetMap-derived public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.",
      };

      try {
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

        if (insertResult.rowCount > 0) {
          inserted += 1;
          featureTypeCounts[featureType] = (featureTypeCounts[featureType] ?? 0) + 1;
        } else {
          skipped += 1;
          skippedReasons.DB_RETURNED_ZERO_ROWS = (skippedReasons.DB_RETURNED_ZERO_ROWS ?? 0) + 1;
        }
      } catch (error) {
        skipped += 1;
        const key = error instanceof Error ? error.message.slice(0, 120) : "UNKNOWN_DB_INSERT_ERROR";
        skippedReasons[key] = (skippedReasons[key] ?? 0) + 1;
      }
    }

    if (inserted === 0) {
      throw new Error("No features were inserted into geo_staging_features.");
    }

    await client.query("COMMIT");

    const payload = {
      phase: "P2.GEO-3C",
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
      "proof/p2-geo-3c-small-staged-import-results",
      payload,
      [
        "# P2.GEO-3C Small Staged Import Results",
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

    console.log(JSON.stringify({ status: "STAGED_IMPORT_PASS", proof: "proof/p2-geo-3c-small-staged-import-results.json" }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    const detail = error instanceof Error ? error.message : String(error);

    const payload = {
      phase: "P2.GEO-3C",
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
