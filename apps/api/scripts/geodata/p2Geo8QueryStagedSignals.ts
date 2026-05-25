import fs from "node:fs";
import path from "node:path";

type StagedSignal = {
  type: string;
  featureType: string;
  name: string;
  distanceKm: number;
  source: string;
  sourceLayer: string;
  sourceId: string;
  sourceLabel: string;
  confidence: string;
  officialVerification: false;
  disclaimer: string;
};

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

const testCoordinate = {
  lat: 38.71,
  lon: 35.5,
  label: "Kayseri POC staged signal test coordinate",
};

const requiredFeatureTypes = [
  {
    featureType: "ADMIN_CENTER",
    signalType: "NEAREST_STAGED_ADMIN_CENTER",
  },
  {
    featureType: "SETTLEMENT",
    signalType: "NEAREST_STAGED_SETTLEMENT",
  },
  {
    featureType: "MAIN_ROAD",
    signalType: "NEAREST_STAGED_MAIN_ROAD",
  },
  {
    featureType: "INDUSTRIAL_OSB_CANDIDATE",
    signalType: "NEAREST_STAGED_INDUSTRIAL_OSB_CANDIDATE",
  },
  {
    featureType: "WATER_FEATURE",
    signalType: "NEAREST_STAGED_WATER_FEATURE",
  },
] as const;

function buildMarkdown(payload: {
  status: string;
  importRunId?: string | number | null;
  signalCount?: number;
  signals?: StagedSignal[];
  detail?: string;
}): string {
  const lines = [
    "# P2.GEO-8 Staged Signal Query Results",
    "",
    `- Status: ${payload.status}`,
    `- Import run id: ${payload.importRunId ?? "n/a"}`,
    `- Signal count: ${payload.signalCount ?? 0}`,
    "",
  ];

  if (payload.detail) {
    lines.push(`- Detail: ${payload.detail}`, "");
  }

  for (const signal of payload.signals ?? []) {
    lines.push(
      `## ${signal.type}`,
      "",
      `- Feature type: ${signal.featureType}`,
      `- Name: ${signal.name}`,
      `- Distance km: ${signal.distanceKm}`,
      `- Source: ${signal.source}`,
      `- Source label: ${signal.sourceLabel}`,
      `- officialVerification: ${signal.officialVerification}`,
      "",
    );
  }

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  if (!process.env.GEODATA_DATABASE_URL) {
    const payload = {
      phase: "P2.GEO-8",
      status: "CONFIG_REQUIRED",
      detail: "GEODATA_DATABASE_URL is missing.",
      testCoordinate,
      generatedAt: new Date().toISOString(),
      productionSwapUsed: false,
      productionTablesQueried: false,
      officialVerification: false,
    };

    writeProofPair(
      "proof/p2-geo-8-staged-signal-query-results",
      payload,
      buildMarkdown(payload),
    );

    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-8-staged-signal-query-results.json" }, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const runResult = await client.query(
      `
      SELECT id
      FROM public.geo_import_runs
      WHERE phase = $1
        AND status = $2
      ORDER BY started_at DESC, id DESC
      LIMIT 1
      `,
      ["P2.GEO-7", "STAGED_IMPORT_PASS"],
    );

    const importRunId = runResult.rows[0]?.id ?? null;

    if (!importRunId) {
      const payload = {
        phase: "P2.GEO-8",
        status: "STAGED_IMPORT_REQUIRED",
        detail: "No latest successful P2.GEO-7 staged import run found.",
        testCoordinate,
        importRunId,
        signalCount: 0,
        signals: [],
        allOfficialVerificationFalse: false,
        productionSwapUsed: false,
        productionTablesQueried: false,
        generatedAt: new Date().toISOString(),
      };

      writeProofPair(
        "proof/p2-geo-8-staged-signal-query-results",
        payload,
        buildMarkdown(payload),
      );

      console.log(JSON.stringify({ status: "STAGED_IMPORT_REQUIRED", proof: "proof/p2-geo-8-staged-signal-query-results.json" }, null, 2));
      return;
    }

    const signals: StagedSignal[] = [];

    for (const required of requiredFeatureTypes) {
      const signalResult = await client.query(
        `
        SELECT
          feature_type,
          source_layer,
          source_id,
          name,
          source_label,
          official_verification,
          properties,
          ROUND(
            (
              ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
              ) / 1000.0
            )::numeric,
            3
          )::float8 AS distance_km
        FROM public.geo_staging_features
        WHERE import_run_id = $1
          AND feature_type = $2
        ORDER BY geom <-> ST_SetSRID(ST_MakePoint($3, $4), 4326)
        LIMIT 1
        `,
        [importRunId, required.featureType, testCoordinate.lon, testCoordinate.lat],
      );

      const row = signalResult.rows[0];

      if (!row) {
        continue;
      }

      const properties = row.properties ?? {};
      const sourceName = String(properties.sourceName ?? "P2_GEO_7_LOCAL_SAMPLE");
      const confidence = String(properties.confidence ?? "POC_ONLY");
      const disclaimer = String(
        properties.disclaimer ??
          "POC-only staged public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.",
      );

      signals.push({
        type: required.signalType,
        featureType: String(row.feature_type),
        name: String(row.name ?? ""),
        distanceKm: Number(row.distance_km ?? 0),
        source: sourceName,
        sourceLayer: String(row.source_layer ?? ""),
        sourceId: String(row.source_id ?? ""),
        sourceLabel: String(row.source_label ?? "PUBLIC_SOURCE_SIGNAL"),
        confidence,
        officialVerification: false,
        disclaimer,
      });
    }

    const requiredSignalTypes = new Set(requiredFeatureTypes.map((item) => item.signalType));
    const returnedSignalTypes = new Set(signals.map((signal) => signal.type));
    const allRequiredSignalsReturned = [...requiredSignalTypes].every((type) => returnedSignalTypes.has(type));
    const allOfficialVerificationFalse = signals.length > 0 && signals.every((signal) => signal.officialVerification === false);
    const labelsDisclaimersPresent =
      signals.length > 0 &&
      signals.every((signal) => Boolean(signal.sourceLabel) && Boolean(signal.disclaimer));

    const status =
      signals.length === 5 &&
      allRequiredSignalsReturned &&
      allOfficialVerificationFalse &&
      labelsDisclaimersPresent
        ? "PASS"
        : "FAIL";

    const payload = {
      phase: "P2.GEO-8",
      status,
      testCoordinate,
      importRunId,
      stagedImportFound: true,
      signals,
      signalCount: signals.length,
      nearestStagedAdminCenter: returnedSignalTypes.has("NEAREST_STAGED_ADMIN_CENTER"),
      nearestStagedSettlement: returnedSignalTypes.has("NEAREST_STAGED_SETTLEMENT"),
      nearestStagedMainRoad: returnedSignalTypes.has("NEAREST_STAGED_MAIN_ROAD"),
      nearestStagedIndustrialOsbCandidate: returnedSignalTypes.has("NEAREST_STAGED_INDUSTRIAL_OSB_CANDIDATE"),
      nearestStagedWaterFeature: returnedSignalTypes.has("NEAREST_STAGED_WATER_FEATURE"),
      allOfficialVerificationFalse,
      labelsDisclaimersPresent,
      productionSwapUsed: false,
      productionTablesQueried: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-8-staged-signal-query-results",
      payload,
      buildMarkdown(payload),
    );

    console.log(JSON.stringify({ status, proof: "proof/p2-geo-8-staged-signal-query-results.json" }, null, 2));

    if (status !== "PASS") {
      process.exitCode = 1;
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const payload = {
      phase: "P2.GEO-8",
      status: "FAIL",
      detail,
      testCoordinate,
      generatedAt: new Date().toISOString(),
      productionSwapUsed: false,
      productionTablesQueried: false,
      officialVerification: false,
    };

    writeProofPair(
      "proof/p2-geo-8-staged-signal-query-results",
      payload,
      buildMarkdown(payload),
    );

    console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-8-staged-signal-query-results.json" }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.GEO-8",
    status: "FAIL",
    detail,
    testCoordinate,
    generatedAt: new Date().toISOString(),
    productionSwapUsed: false,
    productionTablesQueried: false,
    officialVerification: false,
  };

  writeProofPair(
    "proof/p2-geo-8-staged-signal-query-results",
    payload,
    buildMarkdown(payload),
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-8-staged-signal-query-results.json" }, null, 2));
  process.exitCode = 1;
});
