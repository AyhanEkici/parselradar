import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type GeoJsonFeature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: unknown;
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
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function sha256Text(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function main(): Promise<void> {
  const sourcePath = path.resolve("apps/api/scripts/geodata/samples/p2_geo_7_kayseri_sample.geojson");

  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-7",
      step: "sample-staged-import",
      status: "CONFIG_REQUIRED",
      detail: "GEODATA_DATABASE_URL is missing.",
      sourcePathConfigured: true,
      productionSwapAllowed: false,
      officialVerificationAllFalse: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-sample-import-results",
      payload,
      "# P2.GEO-7 Sample Import Results\n\n- Status: CONFIG_REQUIRED\n- Reason: GEODATA_DATABASE_URL is missing.\n",
    );

    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-7-sample-import-results.json" }, null, 2));
    return;
  }

  if (!fs.existsSync(sourcePath)) {
    const payload = {
      phase: "P2.GEO-7",
      step: "sample-staged-import",
      status: "SOURCE_MISSING",
      detail: "Sample GeoJSON file is missing.",
      sourcePath,
      productionSwapAllowed: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-sample-import-results",
      payload,
      "# P2.GEO-7 Sample Import Results\n\n- Status: SOURCE_MISSING\n",
    );

    console.log(JSON.stringify({ status: "SOURCE_MISSING", proof: "proof/p2-geo-7-sample-import-results.json" }, null, 2));
    return;
  }

  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  const features: GeoJsonFeature[] = Array.isArray(parsed.features) ? parsed.features : [];
  const checksum = sha256File(sourcePath);
  const sourcePathHash = sha256Text(sourcePath);

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  let importRunId: string | number | null = null;

  try {
    await client.connect();

    await client.query("BEGIN");

    const runResult = await client.query(
      `
      INSERT INTO public.geo_import_runs (
        phase,
        source_name,
        source_path_hash,
        source_checksum,
        import_scope,
        import_mode,
        status,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
      `,
      [
        "P2.GEO-7",
        "P2_GEO_7_LOCAL_SAMPLE",
        sourcePathHash,
        checksum,
        "KAYSERI_POC_ONLY",
        "STAGED_ONLY",
        "STAGED_IMPORT_STARTED",
        "POC-only local sample import",
      ],
    );

    importRunId = runResult.rows[0]?.id ?? null;

    for (const feature of features) {
      const properties = feature.properties ?? {};
      const geometry = feature.geometry ?? null;

      await client.query(
        `
        INSERT INTO public.geo_staging_features (
          import_run_id,
          feature_type,
          source_layer,
          source_id,
          name,
          properties,
          geom,
          source_label,
          official_verification
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6::jsonb,
          ST_SetSRID(ST_GeomFromGeoJSON($7), 4326),
          $8,
          false
        )
        `,
        [
          importRunId,
          String(properties.featureType ?? "UNKNOWN"),
          String(properties.sourceLayer ?? "p2_geo_7_sample"),
          String(properties.sourceId ?? ""),
          String(properties.name ?? ""),
          JSON.stringify(properties),
          JSON.stringify(geometry),
          String(properties.sourceLabel ?? "PUBLIC_SOURCE_SIGNAL"),
        ],
      );
    }

    await client.query(
      `
      UPDATE public.geo_import_runs
      SET status = $1, completed_at = now()
      WHERE id = $2
      `,
      ["STAGED_IMPORT_PASS", importRunId],
    );

    await client.query("COMMIT");

    const payload = {
      phase: "P2.GEO-7",
      step: "sample-staged-import",
      status: "STAGED_IMPORT_PASS",
      importRunId,
      sourceName: "P2_GEO_7_LOCAL_SAMPLE",
      sourceChecksum: checksum,
      importedFeatureCount: features.length,
      productionSwapAllowed: false,
      officialVerificationAllFalse: true,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-sample-import-results",
      payload,
      [
        "# P2.GEO-7 Sample Import Results",
        "",
        "- Status: STAGED_IMPORT_PASS",
        `- Import run id: ${importRunId}`,
        `- Imported feature count: ${features.length}`,
        "- Production swap allowed: false",
        "- Official verification all false: true",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status: "STAGED_IMPORT_PASS", proof: "proof/p2-geo-7-sample-import-results.json" }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    const payload = {
      phase: "P2.GEO-7",
      step: "sample-staged-import",
      status: "FAIL",
      detail: error instanceof Error ? error.message : String(error),
      importRunId,
      productionSwapAllowed: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-sample-import-results",
      payload,
      `# P2.GEO-7 Sample Import Results\n\n- Status: FAIL\n- Reason: ${payload.detail}\n`,
    );

    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-7-sample-import-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const payload = {
    phase: "P2.GEO-7",
    step: "sample-staged-import",
    status: "FAIL",
    detail: error instanceof Error ? error.message : String(error),
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-7-sample-import-results",
    payload,
    `# P2.GEO-7 Sample Import Results\n\n- Status: FAIL\n- Reason: ${payload.detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-7-sample-import-results.json" }, null, 2));
  process.exitCode = 1;
});
