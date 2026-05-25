import fs from "node:fs";
import path from "node:path";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

async function main(): Promise<void> {
  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-3C",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_DATABASE_URL is missing.",
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };
    writeProofPair("proof/p2-geo-3c-small-staged-import-verification", payload, "# P2.GEO-3C Verification\n\n- Status: CONFIG_REQUIRED\n");
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3c-small-staged-import-verification.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const runResult = await client.query(
      `
      SELECT id, phase, source_name, source_checksum, import_scope, import_mode, status, completed_at
      FROM public.geo_import_runs
      WHERE phase = $1
        AND status = $2
      ORDER BY completed_at DESC, id DESC
      LIMIT 1
      `,
      ["P2.GEO-3C", "STAGED_IMPORT_PASS"],
    );

    const run = runResult.rows[0] ?? null;

    if (!run) {
      const payload = {
        phase: "P2.GEO-3C",
        status: "STAGED_IMPORT_REQUIRED",
        latestRunFound: false,
        productionSwapAllowed: false,
        officialVerification: false,
        generatedAt: new Date().toISOString(),
      };
      writeProofPair("proof/p2-geo-3c-small-staged-import-verification", payload, "# P2.GEO-3C Verification\n\n- Status: STAGED_IMPORT_REQUIRED\n");
      console.log(JSON.stringify({ status: "STAGED_IMPORT_REQUIRED", proof: "proof/p2-geo-3c-small-staged-import-verification.json" }, null, 2));
      process.exitCode = 1;
      return;
    }

    const auditResult = await client.query(
      `
      SELECT
        COUNT(*)::int AS feature_count,
        COUNT(*) FILTER (WHERE geom IS NOT NULL)::int AS non_null_geometry_count,
        COUNT(*) FILTER (WHERE ST_SRID(geom) = 4326)::int AS srid_4326_count,
        COUNT(*) FILTER (WHERE ST_IsValid(geom))::int AS valid_geometry_count,
        COUNT(*) FILTER (WHERE official_verification = false)::int AS official_false_count,
        COUNT(*) FILTER (WHERE source_label = 'PUBLIC_SOURCE_SIGNAL')::int AS public_source_count,
        ARRAY_AGG(DISTINCT feature_type ORDER BY feature_type) AS feature_types
      FROM public.geo_staging_features
      WHERE import_run_id = $1
      `,
      [run.id],
    );

    const row = auditResult.rows[0] ?? {};
    const featureCount = Number(row.feature_count ?? 0);
    const validGeometryCount = Number(row.valid_geometry_count ?? 0);
    const srid4326Count = Number(row.srid_4326_count ?? 0);
    const nonNullGeometryCount = Number(row.non_null_geometry_count ?? 0);
    const officialFalseCount = Number(row.official_false_count ?? 0);
    const publicSourceCount = Number(row.public_source_count ?? 0);
    const featureTypes = Array.isArray(row.feature_types) ? row.feature_types.map(String) : [];

    const status =
      featureCount > 0 &&
      validGeometryCount === featureCount &&
      srid4326Count === featureCount &&
      nonNullGeometryCount === featureCount &&
      officialFalseCount === featureCount &&
      publicSourceCount === featureCount
        ? "PASS"
        : "FAIL";

    const payload = {
      phase: "P2.GEO-3C",
      status,
      latestRunFound: true,
      importRunId: run.id,
      sourceName: run.source_name,
      sourceChecksumVisible: Boolean(run.source_checksum),
      importScope: run.import_scope,
      importMode: run.import_mode,
      featureCount,
      validGeometryCount,
      srid4326Count,
      nonNullGeometryCount,
      officialFalseCount,
      publicSourceCount,
      officialVerificationAllFalse: officialFalseCount === featureCount && featureCount > 0,
      publicSourceSignalAll: publicSourceCount === featureCount && featureCount > 0,
      featureTypes,
      sourceFileCommitted: false,
      rawSourcePathCommitted: false,
      fullTurkeyImportAllowed: false,
      productionSwapAllowed: false,
      productionTablesQueried: false,
      stagingTablesQueried: true,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-3c-small-staged-import-verification",
      payload,
      [
        "# P2.GEO-3C Small Staged Import Verification",
        "",
        `- Status: ${status}`,
        `- Import run id: ${run.id}`,
        `- Feature count: ${featureCount}`,
        `- Valid geometry count: ${validGeometryCount}`,
        `- SRID 4326 count: ${srid4326Count}`,
        `- officialVerification all false: ${payload.officialVerificationAllFalse}`,
        `- Public source signal all: ${payload.publicSourceSignalAll}`,
        "- Production swap allowed: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status, proof: "proof/p2-geo-3c-small-staged-import-verification.json" }, null, 2));

    if (status !== "PASS") {
      process.exitCode = 1;
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const payload = {
      phase: "P2.GEO-3C",
      status: "FAIL",
      detail,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-3c-small-staged-import-verification", payload, `# P2.GEO-3C Verification\n\n- Status: FAIL\n- Detail: ${detail}\n`);
    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3c-small-staged-import-verification.json" }, null, 2));
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
  writeProofPair("proof/p2-geo-3c-small-staged-import-verification", payload, `# P2.GEO-3C Verification\n\n- Status: FAIL\n- Detail: ${detail}\n`);
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3c-small-staged-import-verification.json" }, null, 2));
  process.exitCode = 1;
});
