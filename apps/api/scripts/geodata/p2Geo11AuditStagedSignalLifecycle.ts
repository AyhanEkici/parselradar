import fs from "node:fs";
import path from "node:path";

type ProofStatus = "PASS" | "MISSING" | "UNKNOWN";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function readProofStatus(filePath: string): { exists: boolean; status: ProofStatus; rawStatus: string | null } {
  if (!fs.existsSync(filePath)) {
    return { exists: false, status: "MISSING", rawStatus: null };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
    const rawStatus = String(parsed.status ?? parsed.overallStatus ?? "UNKNOWN");
    return {
      exists: true,
      status: rawStatus === "PASS" ? "PASS" : "UNKNOWN",
      rawStatus,
    };
  } catch {
    return { exists: true, status: "UNKNOWN", rawStatus: "PARSE_ERROR" };
  }
}

function buildMarkdown(payload: Record<string, any>): string {
  return [
    "# P2.GEO-11 Staged Signal Lifecycle Audit",
    "",
    `- Status: ${payload.status}`,
    `- Lifecycle state: ${payload.lifecycleState}`,
    `- Latest run found: ${payload.latestRunFound}`,
    `- Latest run id: ${payload.latestRun?.id ?? "n/a"}`,
    `- Latest run status: ${payload.latestRun?.status ?? "n/a"}`,
    `- Source name: ${payload.latestRun?.sourceName ?? "n/a"}`,
    `- Source checksum visible: ${payload.sourceChecksumVisible}`,
    `- Import scope: ${payload.latestRun?.importScope ?? "n/a"}`,
    `- Import mode: ${payload.latestRun?.importMode ?? "n/a"}`,
    `- Import age minutes: ${payload.latestRun?.ageMinutes ?? "n/a"}`,
    `- Feature count: ${payload.featureAudit?.featureCount ?? 0}`,
    `- Valid geometry count: ${payload.featureAudit?.validGeometryCount ?? 0}`,
    `- SRID 4326 count: ${payload.featureAudit?.srid4326Count ?? 0}`,
    `- officialVerification all false: ${payload.featureAudit?.officialVerificationAllFalse ?? false}`,
    `- publicSourceSignal all: ${payload.featureAudit?.publicSourceSignalAll ?? false}`,
    `- Required feature type coverage: ${payload.requiredFeatureTypeCoverage}`,
    `- Signal proof readiness: ${payload.signalProofReadiness}`,
    `- Production swap used: false`,
    `- Production tables queried: false`,
    `- Connector activated: false`,
    `- Scraping added: false`,
    `- Official verification claim added: false`,
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-11",
      status: "CONFIG_REQUIRED",
      lifecycleState: "CONFIG_REQUIRED",
      detail: "GEODATA_DATABASE_URL is missing.",
      productionSwapUsed: false,
      productionTablesQueried: false,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerificationClaimAdded: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-11-lifecycle-audit-results", payload, buildMarkdown(payload));
    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-11-lifecycle-audit-results.json" }, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const latestRunResult = await client.query(
      `
      SELECT
        id,
        phase,
        source_name,
        source_checksum,
        import_scope,
        import_mode,
        status,
        started_at,
        completed_at,
        notes,
        ROUND((EXTRACT(EPOCH FROM (now() - COALESCE(completed_at, started_at))) / 60.0)::numeric, 2)::float8 AS age_minutes
      FROM public.geo_import_runs
      WHERE phase = $1
      ORDER BY started_at DESC, id DESC
      LIMIT 1
      `,
      ["P2.GEO-7"],
    );

    const latestRunRow = latestRunResult.rows[0] ?? null;

    if (!latestRunRow) {
      const payload = {
        phase: "P2.GEO-11",
        status: "STAGED_IMPORT_REQUIRED",
        lifecycleState: "STAGED_IMPORT_REQUIRED",
        latestRunFound: false,
        productionSwapUsed: false,
        productionTablesQueried: false,
        connectorActivated: false,
        scrapingAdded: false,
        officialVerificationClaimAdded: false,
        generatedAt: new Date().toISOString(),
      };

      writeProofPair("proof/p2-geo-11-lifecycle-audit-results", payload, buildMarkdown(payload));
      console.log(JSON.stringify({ status: "STAGED_IMPORT_REQUIRED", proof: "proof/p2-geo-11-lifecycle-audit-results.json" }, null, 2));
      return;
    }

    const latestRun = {
      id: latestRunRow.id,
      phase: String(latestRunRow.phase),
      sourceName: String(latestRunRow.source_name ?? ""),
      sourceChecksum: String(latestRunRow.source_checksum ?? ""),
      importScope: String(latestRunRow.import_scope ?? ""),
      importMode: String(latestRunRow.import_mode ?? ""),
      status: String(latestRunRow.status ?? ""),
      startedAt: latestRunRow.started_at,
      completedAt: latestRunRow.completed_at,
      ageMinutes: Number(latestRunRow.age_minutes ?? 0),
      notes: latestRunRow.notes ? String(latestRunRow.notes) : null,
    };

    const featureAuditResult = await client.query(
      `
      SELECT
        COUNT(*)::int AS feature_count,
        COUNT(*) FILTER (WHERE geom IS NOT NULL)::int AS non_null_geometry_count,
        COUNT(*) FILTER (WHERE ST_SRID(geom) = 4326)::int AS srid_4326_count,
        COUNT(*) FILTER (WHERE ST_IsValid(geom))::int AS valid_geometry_count,
        COUNT(*) FILTER (WHERE official_verification = false)::int AS official_false_count,
        COUNT(*) FILTER (WHERE source_label = 'PUBLIC_SOURCE_SIGNAL')::int AS public_source_count,
        COUNT(DISTINCT feature_type)::int AS distinct_feature_type_count,
        ARRAY_AGG(DISTINCT feature_type ORDER BY feature_type) AS feature_types
      FROM public.geo_staging_features
      WHERE import_run_id = $1
      `,
      [latestRun.id],
    );

    const featureRow = featureAuditResult.rows[0] ?? {};
    const featureCount = Number(featureRow.feature_count ?? 0);
    const validGeometryCount = Number(featureRow.valid_geometry_count ?? 0);
    const srid4326Count = Number(featureRow.srid_4326_count ?? 0);
    const nonNullGeometryCount = Number(featureRow.non_null_geometry_count ?? 0);
    const officialFalseCount = Number(featureRow.official_false_count ?? 0);
    const publicSourceCount = Number(featureRow.public_source_count ?? 0);
    const featureTypes = Array.isArray(featureRow.feature_types) ? featureRow.feature_types.map(String) : [];

    const requiredFeatureTypes = [
      "ADMIN_CENTER",
      "SETTLEMENT",
      "MAIN_ROAD",
      "INDUSTRIAL_OSB_CANDIDATE",
      "WATER_FEATURE",
    ];

    const missingFeatureTypes = requiredFeatureTypes.filter((featureType) => !featureTypes.includes(featureType));
    const requiredFeatureTypeCoverage = missingFeatureTypes.length === 0;

    const proofStatuses = {
      p2Geo7Verification: readProofStatus("proof/p2-geo-7-staged-import-verification.json"),
      p2Geo8SignalQuery: readProofStatus("proof/p2-geo-8-staged-signal-query-results.json"),
      p2Geo9ApiResults: readProofStatus("proof/p2-geo-9-staged-signal-api-results.json"),
      p2Geo10DiagnosticSurface: readProofStatus("proof/p2-geo-10-admin-diagnostic-surface-results.json"),
    };

    const signalProofReadiness = Object.values(proofStatuses).every((item) => item.exists && item.rawStatus === "PASS");

    const sourceChecksumVisible = latestRun.sourceChecksum.length > 0;
    const latestRunReady = latestRun.status === "STAGED_IMPORT_PASS";
    const featureAuditReady =
      featureCount === 5 &&
      validGeometryCount === 5 &&
      srid4326Count === 5 &&
      nonNullGeometryCount === 5 &&
      officialFalseCount === featureCount &&
      publicSourceCount === featureCount &&
      requiredFeatureTypeCoverage;

    const status =
      latestRunReady &&
      sourceChecksumVisible &&
      featureAuditReady &&
      signalProofReadiness
        ? "PASS"
        : "FAIL";

    const lifecycleState = status === "PASS" ? "STAGED_SIGNAL_READY" : "STAGED_SIGNAL_INCOMPLETE";

    const payload = {
      phase: "P2.GEO-11",
      status,
      lifecycleState,
      latestRunFound: true,
      latestRun,
      sourceChecksumVisible,
      featureAudit: {
        featureCount,
        nonNullGeometryCount,
        srid4326Count,
        validGeometryCount,
        officialFalseCount,
        publicSourceCount,
        officialVerificationAllFalse: officialFalseCount === featureCount && featureCount > 0,
        publicSourceSignalAll: publicSourceCount === featureCount && featureCount > 0,
        featureTypes,
        missingFeatureTypes,
      },
      requiredFeatureTypeCoverage,
      proofStatuses,
      signalProofReadiness,
      productionSwapUsed: false,
      productionTablesQueried: false,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerificationClaimAdded: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-11-lifecycle-audit-results", payload, buildMarkdown(payload));
    console.log(JSON.stringify({ status, lifecycleState, proof: "proof/p2-geo-11-lifecycle-audit-results.json" }, null, 2));

    if (status !== "PASS") {
      process.exitCode = 1;
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const payload = {
      phase: "P2.GEO-11",
      status: "FAIL",
      lifecycleState: "FAIL",
      detail,
      productionSwapUsed: false,
      productionTablesQueried: false,
      connectorActivated: false,
      scrapingAdded: false,
      officialVerificationClaimAdded: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair("proof/p2-geo-11-lifecycle-audit-results", payload, buildMarkdown(payload));
    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-11-lifecycle-audit-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-11",
    status: "FAIL",
    lifecycleState: "FAIL",
    detail,
    productionSwapUsed: false,
    productionTablesQueried: false,
    connectorActivated: false,
    scrapingAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair("proof/p2-geo-11-lifecycle-audit-results", payload, buildMarkdown(payload));
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-11-lifecycle-audit-results.json" }, null, 2));
  process.exitCode = 1;
});
