import fs from "node:fs";
import path from "node:path";
import { queryStagedSignalsFromPostgis } from "../../src/geodata/stagedSignalAdapter";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function minutesSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((Date.now() - date.getTime()) / 60000);
}

async function main(): Promise<void> {
  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-3F",
      status: "CONFIG_REQUIRED",
      blocker: "GEODATA_DATABASE_URL is missing.",
      readOnlyAudit: true,
      cleanupExecuted: false,
      newImportExecuted: false,
      productionSwapUsed: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-3f-freshness-duplicate-policy-results",
      payload,
      "# P2.GEO-3F Freshness Duplicate Policy\n\n- Status: CONFIG_REQUIRED\n",
    );

    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-3f-freshness-duplicate-policy-results.json" }, null, 2));
    process.exitCode = 1;
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const adapterResult = await queryStagedSignalsFromPostgis({
      lat: 38.71,
      lon: 35.5,
      label: "P2.GEO-3F staged freshness duplicate policy audit",
    });

    await client.query("BEGIN READ ONLY");

    const latestRunResult = await client.query(
      `
      SELECT id, phase, source_name, source_checksum, import_scope, import_mode, status, started_at, completed_at, notes
      FROM public.geo_import_runs
      WHERE phase IN ('P2.GEO-3H', 'P2.GEO-3C')
        AND status = 'STAGED_IMPORT_PASS'
      ORDER BY completed_at DESC NULLS LAST, id DESC
      LIMIT 1
      `,
    );

    const latestRun = latestRunResult.rows[0] ?? null;

    const runAuditResult = await client.query(
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
        notes
      FROM public.geo_import_runs
      WHERE phase IN ('P2.GEO-3H', 'P2.GEO-3C')
      ORDER BY completed_at DESC NULLS LAST, id DESC
      LIMIT 25
      `,
    );

    const duplicateAuditResult = await client.query(
      `
      WITH ranked AS (
        SELECT
          id,
          source_name,
          source_checksum,
          import_scope,
          import_mode,
          status,
          completed_at,
          ROW_NUMBER() OVER (
            PARTITION BY source_checksum
            ORDER BY completed_at DESC NULLS LAST, id DESC
          ) AS rn,
          COUNT(*) OVER (PARTITION BY source_checksum) AS checksum_run_count
        FROM public.geo_import_runs
        WHERE phase IN ('P2.GEO-3H', 'P2.GEO-3C')
          AND status = 'STAGED_IMPORT_PASS'
          AND source_checksum IS NOT NULL
      )
      SELECT
        id,
        source_name,
        source_checksum,
        import_scope,
        import_mode,
        status,
        completed_at,
        rn,
        checksum_run_count,
        CASE WHEN rn = 1 THEN 'CANONICAL_KEEP' ELSE 'REDUNDANT_HISTORY_CANDIDATE' END AS policy_action
      FROM ranked
      ORDER BY source_checksum, rn
      `,
    );

    const featureAuditResult = latestRun
      ? await client.query(
          `
          SELECT
            COUNT(*)::int AS feature_count,
            COUNT(*) FILTER (WHERE official_verification = false)::int AS official_false_count,
            COUNT(*) FILTER (WHERE source_label = 'PUBLIC_SOURCE_SIGNAL')::int AS public_source_count,
            ARRAY_AGG(DISTINCT feature_type ORDER BY feature_type) AS feature_types
          FROM public.geo_staging_features
          WHERE import_run_id = $1
          `,
          [latestRun.id],
        )
      : { rows: [] as any[] };

    await client.query("COMMIT");

    const featureAudit = featureAuditResult.rows[0] ?? {};
    const featureCount = Number(featureAudit.feature_count ?? 0);
    const officialFalseCount = Number(featureAudit.official_false_count ?? 0);
    const publicSourceCount = Number(featureAudit.public_source_count ?? 0);
    const featureTypes = Array.isArray(featureAudit.feature_types) ? featureAudit.feature_types.map(String).filter(Boolean) : [];

    const duplicateRows = duplicateAuditResult.rows;
    const redundantCandidates = duplicateRows.filter((row: any) => row.policy_action === "REDUNDANT_HISTORY_CANDIDATE");
    const canonicalRows = duplicateRows.filter((row: any) => row.policy_action === "CANONICAL_KEEP");

    const latestRunId = latestRun?.id ?? null;
    const adapterRunId = adapterResult.importRunId ?? null;
    const adapterUsesLatestRun = String(adapterRunId) === String(latestRunId);

    const runAgeMinutes = minutesSince(latestRun?.completed_at ? String(latestRun.completed_at) : null);

    const status =
      latestRun &&
      adapterResult.status === "PASS" &&
      adapterUsesLatestRun &&
      featureCount > 0 &&
      officialFalseCount === featureCount &&
      publicSourceCount === featureCount &&
      adapterResult.productionSwapUsed === false &&
      adapterResult.productionTablesQueried === false
        ? "PASS"
        : "FAIL";

    const payload = {
      phase: "P2.GEO-3F",
      status,
      readOnlyAudit: true,
      cleanupExecuted: false,
      newImportExecuted: false,
      latestRunFound: Boolean(latestRun),
      latestRun: latestRun
        ? {
            id: latestRun.id,
            phase: latestRun.phase,
            sourceName: latestRun.source_name,
            sourceChecksumVisible: Boolean(latestRun.source_checksum),
            importScope: latestRun.import_scope,
            importMode: latestRun.import_mode,
            status: latestRun.status,
            startedAt: latestRun.started_at,
            completedAt: latestRun.completed_at,
            runAgeMinutes,
          }
        : null,
      adapterStatus: adapterResult.status,
      adapterLifecycleState: adapterResult.lifecycleState,
      adapterRunId,
      adapterUsesLatestRun,
      featureCount,
      officialFalseCount,
      publicSourceCount,
      featureTypes,
      allOfficialVerificationFalse: featureCount > 0 && officialFalseCount === featureCount,
      labelsDisclaimersPresent: featureCount > 0 && publicSourceCount === featureCount,
      recentRunCount: runAuditResult.rows.length,
      recentRuns: runAuditResult.rows.map((row: any) => ({
        id: row.id,
        phase: row.phase,
        sourceName: row.source_name,
        sourceChecksumVisible: Boolean(row.source_checksum),
        importScope: row.import_scope,
        importMode: row.import_mode,
        status: row.status,
        completedAt: row.completed_at,
      })),
      duplicatePolicy: {
        canonicalSelection: "LATEST_SUCCESSFUL_STAGED_GEO_RUN_PER_SOURCE_CHECKSUM",
        duplicateDefinition: "Same staged source_checksum with STAGED_IMPORT_PASS",
        cleanupMode: "READ_ONLY_POLICY_ONLY",
        cleanupExecuted: false,
        futureAllowedAction: "manual/admin cleanup in separate explicit phase only",
      },
      canonicalRunCount: canonicalRows.length,
      redundantCandidateCount: redundantCandidates.length,
      duplicateRows: duplicateRows.map((row: any) => ({
        id: row.id,
        sourceName: row.source_name,
        sourceChecksumVisible: Boolean(row.source_checksum),
        importScope: row.import_scope,
        importMode: row.import_mode,
        status: row.status,
        completedAt: row.completed_at,
        rankWithinChecksum: Number(row.rn),
        checksumRunCount: Number(row.checksum_run_count),
        policyAction: row.policy_action,
      })),
      sourceFileCommitted: false,
      fullTurkeyImportAllowed: false,
      productionSwapUsed: false,
      productionTablesQueried: false,
      connectorActivated: false,
      scrapingAdded: false,
      schedulerAdded: false,
      officialVerificationClaimAdded: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-3f-freshness-duplicate-policy-results",
      payload,
      [
        "# P2.GEO-3F Freshness Duplicate Policy Results",
        "",
        `- Status: ${status}`,
        "- Read-only audit: true",
        "- Cleanup executed: false",
        "- New import executed: false",
        `- Latest run found: ${Boolean(latestRun)}`,
        `- Latest run id: ${latestRunId ?? "n/a"}`,
        `- Adapter run id: ${adapterRunId ?? "n/a"}`,
        `- Adapter uses latest run: ${adapterUsesLatestRun}`,
        `- Run age minutes: ${runAgeMinutes ?? "n/a"}`,
        `- Feature count: ${featureCount}`,
        `- Feature types: ${featureTypes.join(", ")}`,
        `- Canonical run count: ${canonicalRows.length}`,
        `- Redundant candidate count: ${redundantCandidates.length}`,
        "- Production swap used: false",
        "- Production tables queried: false",
        "- Source file committed: false",
        "",
      ].join("\n"),
    );

    console.log(JSON.stringify({ status, proof: "proof/p2-geo-3f-freshness-duplicate-policy-results.json" }, null, 2));

    if (status !== "PASS") {
      process.exitCode = 1;
    }
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);

    const payload = {
      phase: "P2.GEO-3F",
      status: "FAIL",
      detail,
      readOnlyAudit: true,
      cleanupExecuted: false,
      newImportExecuted: false,
      productionSwapUsed: false,
      productionTablesQueried: false,
      sourceFileCommitted: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-3f-freshness-duplicate-policy-results",
      payload,
      `# P2.GEO-3F Freshness Duplicate Policy Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
    );

    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3f-freshness-duplicate-policy-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-3F",
    status: "FAIL",
    detail,
    readOnlyAudit: true,
    cleanupExecuted: false,
    newImportExecuted: false,
    productionSwapUsed: false,
    productionTablesQueried: false,
    sourceFileCommitted: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-3f-freshness-duplicate-policy-results",
    payload,
    `# P2.GEO-3F Freshness Duplicate Policy Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-3f-freshness-duplicate-policy-results.json" }, null, 2));
  process.exitCode = 1;
});


