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
      phase: "P2.GEO-7",
      step: "verify-staged-import",
      status: "CONFIG_REQUIRED",
      detail: "GEODATA_DATABASE_URL is missing.",
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-staged-import-verification",
      payload,
      "# P2.GEO-7 Staged Import Verification\n\n- Status: CONFIG_REQUIRED\n",
    );

    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-7-staged-import-verification.json" }, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const latestRun = await client.query(
      `
      SELECT id, status
      FROM public.geo_import_runs
      WHERE phase = $1
      ORDER BY started_at DESC, id DESC
      LIMIT 1
      `,
      ["P2.GEO-7"],
    );

    const importRunId = latestRun.rows[0]?.id ?? null;

    if (!importRunId) {
      const payload = {
        phase: "P2.GEO-7",
        step: "verify-staged-import",
        status: "FAIL",
        detail: "No P2.GEO-7 import run found.",
        generatedAt: new Date().toISOString(),
      };

      writeProofPair(
        "proof/p2-geo-7-staged-import-verification",
        payload,
        "# P2.GEO-7 Staged Import Verification\n\n- Status: FAIL\n- Reason: No P2.GEO-7 import run found.\n",
      );

      console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-7-staged-import-verification.json" }, null, 2));
      process.exitCode = 1;
      return;
    }

    const verification = await client.query(
      `
      SELECT
        COUNT(*)::int AS feature_count,
        COUNT(*) FILTER (WHERE official_verification = false)::int AS official_false_count,
        COUNT(*) FILTER (WHERE source_label = 'PUBLIC_SOURCE_SIGNAL')::int AS public_source_count,
        COUNT(*) FILTER (WHERE geom IS NOT NULL)::int AS non_null_geom_count,
        COUNT(*) FILTER (WHERE ST_SRID(geom) = 4326)::int AS srid_4326_count,
        COUNT(*) FILTER (WHERE ST_IsValid(geom))::int AS valid_geom_count
      FROM public.geo_staging_features
      WHERE import_run_id = $1
      `,
      [importRunId],
    );

    const row = verification.rows[0] ?? {};
    const featureCount = Number(row.feature_count ?? 0);
    const officialFalseCount = Number(row.official_false_count ?? 0);
    const publicSourceCount = Number(row.public_source_count ?? 0);
    const nonNullGeomCount = Number(row.non_null_geom_count ?? 0);
    const srid4326Count = Number(row.srid_4326_count ?? 0);
    const validGeomCount = Number(row.valid_geom_count ?? 0);

    const status =
      featureCount === 5 &&
      officialFalseCount === 5 &&
      publicSourceCount === 5 &&
      nonNullGeomCount === 5 &&
      srid4326Count === 5 &&
      validGeomCount === 5
        ? "PASS"
        : "FAIL";

    const payload = {
      phase: "P2.GEO-7",
      step: "verify-staged-import",
      status,
      importRunId,
      importedFeatureCount: featureCount,
      validGeometryCount: validGeomCount,
      nonNullGeometryCount: nonNullGeomCount,
      srid4326Count,
      officialVerificationAllFalse: officialFalseCount === featureCount && featureCount > 0,
      publicSourceSignalAll: publicSourceCount === featureCount && featureCount > 0,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-7-staged-import-verification",
      payload,
      [
        "# P2.GEO-7 Staged Import Verification",
        "",
        `- Status: ${status}`,
        `- Import run id: ${importRunId}`,
        `- Imported feature count: ${featureCount}`,
        `- Valid geometry count: ${validGeomCount}`,
        `- SRID 4326 count: ${srid4326Count}`,
        `- officialVerification all false: ${officialFalseCount === featureCount && featureCount > 0}`,
        "- Production swap allowed: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status, proof: "proof/p2-geo-7-staged-import-verification.json" }, null, 2));
    if (status !== "PASS") {
      process.exitCode = 1;
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const payload = {
    phase: "P2.GEO-7",
    step: "verify-staged-import",
    status: "FAIL",
    detail: error instanceof Error ? error.message : String(error),
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-7-staged-import-verification",
    payload,
    `# P2.GEO-7 Staged Import Verification\n\n- Status: FAIL\n- Reason: ${payload.detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-7-staged-import-verification.json" }, null, 2));
  process.exitCode = 1;
});
