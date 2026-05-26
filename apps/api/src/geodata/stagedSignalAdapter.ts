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

type LatestRun = {
  id: number | string;
  phase: string;
  sourceName: string;
  importScope: string;
  importMode: string;
  status: string;
  completedAt: string | null;
};

type QueryResult = {
  phase: string;
  status: string;
  lifecycleState: string;
  runPhase?: string;
  latestRun?: LatestRun | null;
  importRunId?: number | string | null;
  signalCount: number;
  featureCount: number;
  featureTypes: string[];
  missingFeatureTypes: string[];
  coverageMode: string;
  testCoordinate: {
    lat: number;
    lon: number;
    label: string;
  };
  signals: StagedSignal[];
  nearestStagedAdminCenter: StagedSignal | null;
  nearestStagedSettlement: StagedSignal | null;
  nearestStagedMainRoad: StagedSignal | null;
  nearestStagedIndustrialOsbCandidate: StagedSignal | null;
  nearestStagedWaterFeature: StagedSignal | null;
  allOfficialVerificationFalse: boolean;
  labelsDisclaimersPresent: boolean;
  officialVerification: false;
  productionSwapUsed: false;
  productionTablesQueried: false;
  stagingTablesQueried: boolean;
  detail?: string;
};

const TEST_LAT = 38.71;
const TEST_LON = 35.5;

const FEATURE_TO_SIGNAL: Record<string, string> = {
  ADMIN_CENTER: "nearestStagedAdminCenter",
  SETTLEMENT: "nearestStagedSettlement",
  MAIN_ROAD: "nearestStagedMainRoad",
  INDUSTRIAL_OSB_CANDIDATE: "nearestStagedIndustrialOsbCandidate",
  WATER_FEATURE: "nearestStagedWaterFeature",
};

function emptyResult(status: string, detail?: string): QueryResult {
  return {
    phase: "P2.GEO-3D",
    status,
    lifecycleState: status,
    latestRun: null,
    importRunId: null,
    signalCount: 0,
    featureCount: 0,
    featureTypes: [],
    missingFeatureTypes: [],
    coverageMode: "NO_DATA",
    testCoordinate: {
      lat: TEST_LAT,
      lon: TEST_LON,
      label: "Kayseri staged signal test coordinate",
    },
    signals: [],
    nearestStagedAdminCenter: null,
    nearestStagedSettlement: null,
    nearestStagedMainRoad: null,
    nearestStagedIndustrialOsbCandidate: null,
    nearestStagedWaterFeature: null,
    allOfficialVerificationFalse: false,
    labelsDisclaimersPresent: false,
    officialVerification: false,
    productionSwapUsed: false,
    productionTablesQueried: false,
    stagingTablesQueried: false,
    detail,
  };
}

function toSignal(row: any): StagedSignal {
  return {
    type: String(row.signal_type),
    featureType: String(row.feature_type),
    name: String(row.name ?? row.source_id),
    distanceKm: Number(row.distance_km ?? 0),
    source: "POSTGIS_STAGING",
    sourceLayer: String(row.source_layer ?? "unknown"),
    sourceId: String(row.source_id ?? "unknown"),
    sourceLabel: String(row.source_label ?? "PUBLIC_SOURCE_SIGNAL"),
    confidence: String(row.confidence ?? "STAGED_OSM_SIGNAL"),
    officialVerification: false,
    disclaimer:
      String(row.disclaimer ?? "") ||
      "OpenStreetMap-derived public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.",
  };
}

export async function queryStagedSignalsFromPostgis(): Promise<QueryResult> {
  if (!process.env.GEODATA_DATABASE_URL) {
    return emptyResult("CONFIG_REQUIRED", "GEODATA_DATABASE_URL is missing.");
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();

    const latestRunResult = await client.query(
      `
      SELECT id, phase, source_name, import_scope, import_mode, status, completed_at
      FROM public.geo_import_runs
      WHERE phase IN ('P2.GEO-3C', 'P2.GEO-7')
        AND status = 'STAGED_IMPORT_PASS'
      ORDER BY
        CASE WHEN phase = 'P2.GEO-3C' THEN 0 ELSE 1 END,
        completed_at DESC NULLS LAST,
        id DESC
      LIMIT 1
      `,
    );

    const run = latestRunResult.rows[0] ?? null;

    if (!run) {
      return emptyResult("STAGED_IMPORT_REQUIRED", "No staged import run found.");
    }

    const featureAuditResult = await client.query(
      `
      SELECT
        COUNT(*)::int AS feature_count,
        COUNT(*) FILTER (WHERE official_verification = false)::int AS official_false_count,
        COUNT(*) FILTER (WHERE source_label = 'PUBLIC_SOURCE_SIGNAL')::int AS public_source_count,
        ARRAY_AGG(DISTINCT feature_type ORDER BY feature_type) AS feature_types
      FROM public.geo_staging_features
      WHERE import_run_id = $1
      `,
      [run.id],
    );

    const featureAudit = featureAuditResult.rows[0] ?? {};
    const featureCount = Number(featureAudit.feature_count ?? 0);
    const officialFalseCount = Number(featureAudit.official_false_count ?? 0);
    const publicSourceCount = Number(featureAudit.public_source_count ?? 0);
    const featureTypes = Array.isArray(featureAudit.feature_types)
      ? featureAudit.feature_types.map(String).filter(Boolean)
      : [];

    const expectedFeatureTypes = ["SETTLEMENT", "MAIN_ROAD", "INDUSTRIAL_OSB_CANDIDATE", "WATER_FEATURE", "ADMIN_CENTER"];
    const missingFeatureTypes = expectedFeatureTypes.filter((featureType) => !featureTypes.includes(featureType));

    const nearestResult = await client.query(
      `
      WITH ranked AS (
        SELECT
          f.feature_type,
          CASE
            WHEN f.feature_type = 'ADMIN_CENTER' THEN 'nearestStagedAdminCenter'
            WHEN f.feature_type = 'SETTLEMENT' THEN 'nearestStagedSettlement'
            WHEN f.feature_type = 'MAIN_ROAD' THEN 'nearestStagedMainRoad'
            WHEN f.feature_type = 'INDUSTRIAL_OSB_CANDIDATE' THEN 'nearestStagedIndustrialOsbCandidate'
            WHEN f.feature_type = 'WATER_FEATURE' THEN 'nearestStagedWaterFeature'
            ELSE 'nearestStagedOther'
          END AS signal_type,
          f.name,
          f.source_layer,
          f.source_id,
          f.source_label,
          COALESCE(f.properties->>'confidence', 'STAGED_OSM_SIGNAL') AS confidence,
          COALESCE(
            f.properties->>'disclaimer',
            'OpenStreetMap-derived public-source signal. Not official tapu, imar, cadastre, zoning, legal, investment or construction verification.'
          ) AS disclaimer,
          ROUND((ST_DistanceSphere(f.geom, ST_SetSRID(ST_MakePoint($2, $3), 4326)) / 1000.0)::numeric, 3)::float8 AS distance_km,
          ROW_NUMBER() OVER (
            PARTITION BY f.feature_type
            ORDER BY ST_DistanceSphere(f.geom, ST_SetSRID(ST_MakePoint($2, $3), 4326)) ASC
          ) AS rn
        FROM public.geo_staging_features f
        WHERE f.import_run_id = $1
          AND f.geom IS NOT NULL
          AND f.feature_type IN ('ADMIN_CENTER', 'SETTLEMENT', 'MAIN_ROAD', 'INDUSTRIAL_OSB_CANDIDATE', 'WATER_FEATURE')
      )
      SELECT *
      FROM ranked
      WHERE rn = 1
      ORDER BY feature_type
      `,
      [run.id, TEST_LON, TEST_LAT],
    );

    const signals = nearestResult.rows.map(toSignal);
    const bySignalType = new Map(signals.map((signal) => [signal.type, signal]));

    const allOfficialVerificationFalse = featureCount > 0 && officialFalseCount === featureCount;
    const labelsDisclaimersPresent = featureCount > 0 && publicSourceCount === featureCount;

    const latestRun: LatestRun = {
      id: run.id,
      phase: String(run.phase),
      sourceName: String(run.source_name),
      importScope: String(run.import_scope),
      importMode: String(run.import_mode),
      status: String(run.status),
      completedAt: run.completed_at ? String(run.completed_at) : null,
    };

    return {
      phase: "P2.GEO-3D",
      status: "PASS",
      lifecycleState: "STAGED_OSM_SIGNAL_READY",
      runPhase: latestRun.phase,
      latestRun,
      importRunId: latestRun.id,
      signalCount: signals.length,
      featureCount,
      featureTypes,
      missingFeatureTypes,
      coverageMode: "SMALL_SOURCE_PARTIAL_COVERAGE_OK",
      testCoordinate: {
        lat: TEST_LAT,
        lon: TEST_LON,
        label: "Kayseri staged signal test coordinate",
      },
      signals,
      nearestStagedAdminCenter: bySignalType.get("nearestStagedAdminCenter") ?? null,
      nearestStagedSettlement: bySignalType.get("nearestStagedSettlement") ?? null,
      nearestStagedMainRoad: bySignalType.get("nearestStagedMainRoad") ?? null,
      nearestStagedIndustrialOsbCandidate: bySignalType.get("nearestStagedIndustrialOsbCandidate") ?? null,
      nearestStagedWaterFeature: bySignalType.get("nearestStagedWaterFeature") ?? null,
      allOfficialVerificationFalse,
      labelsDisclaimersPresent,
      officialVerification: false,
      productionSwapUsed: false,
      productionTablesQueried: false,
      stagingTablesQueried: true,
    };
  } catch (error) {
    return emptyResult("FAIL", error instanceof Error ? error.message : String(error));
  } finally {
    await client.end().catch(() => undefined);
  }
}
