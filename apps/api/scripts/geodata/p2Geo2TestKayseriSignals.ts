import fs from 'fs';
import path from 'path';

type SignalType =
  | 'NEAREST_DISTRICT_CENTER'
  | 'NEAREST_MAIN_ROAD'
  | 'NEAREST_SETTLEMENT'
  | 'INDUSTRIAL_OR_OSB_PROXIMITY'
  | 'WATER_OR_COAST_PROXIMITY'
  | 'TOURISM_PROXIMITY'
  | 'TERRAIN_ELEVATION'
  | 'HAZARD_CONTEXT_PLACEHOLDER';

type PocStatus = 'PASS' | 'CONFIG_REQUIRED' | 'FAIL';

interface SignalRecord {
  type: SignalType;
  value: string;
  distanceKm: number | null;
  source: string;
  sourceVersion: string;
  confidence: string;
  officialVerification: false;
  label: string;
  disclaimer: string;
}

const ROOT = process.cwd();
const JSON_PROOF_PATH = path.join(ROOT, 'proof/p2-geo-2-kayseri-signal-results.json');
const MD_PROOF_PATH = path.join(ROOT, 'proof/p2-geo-2-kayseri-signal-results.md');

const TEST_COORDINATE = {
  lat: 38.71,
  lon: 35.5,
  location: 'Kayseri POC test coordinate',
};

const BASE_DISCLAIMER =
  'Public-source approximate signal for POC. Not official tapu/imar verification. Official confirmation is required.';

function writeProof(payload: Record<string, unknown>, markdown: string) {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(JSON_PROOF_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(MD_PROOF_PATH, `${markdown}\n`, 'utf8');
}

function toKm(meters: unknown): number | null {
  const numeric = Number(meters);
  if (!Number.isFinite(numeric)) return null;
  return Number((numeric / 1000).toFixed(3));
}

function rowSourceVersion(row: any): string {
  if (row?.versionHash) return String(row.versionHash);
  if (row?.sourceversion) return String(row.sourceversion);
  return 'unknown-source-version';
}

async function main() {
  const geodataDatabaseUrl = String(process.env.GEODATA_DATABASE_URL || '').trim();
  if (!geodataDatabaseUrl) {
    const payload = {
      phase: 'P2.GEO-2',
      status: 'CONFIG_REQUIRED',
      message: 'GEODATA_DATABASE_URL is missing. Configure local/managed PostGIS for POC.',
      testCoordinate: TEST_COORDINATE,
      recommendedAction: 'Set GEODATA_DATABASE_URL and run schema + seed + geo:p2-geo-2:test again.',
      nonFatal: true,
      generatedAt: new Date().toISOString(),
    };

    const markdown = [
      '# P2.GEO-2 Kayseri Signal Results',
      '',
      '## Status',
      '- CONFIG_REQUIRED',
      '',
      '## Reason',
      '- GEODATA_DATABASE_URL is missing. Configure local/managed PostGIS for POC.',
      '',
      '## Recommended Action',
      '- Set GEODATA_DATABASE_URL P2_1B_TRIAGED_BACKLOG/real connection in your shell.',
      '- Run geo:p2-geo-2:schema then geo:p2-geo-2:seed then geo:p2-geo-2:test.',
      '',
      '## Product Impact',
      '- Non-fatal for product baseline. This POC path is optional and isolated.',
    ].join('\n');

    writeProof(payload, markdown);
    console.log(JSON.stringify({ status: payload.status, proof: 'proof/p2-geo-2-kayseri-signal-results.json' }, null, 2));
    process.exit(0);
  }

  let ClientCtor: any;
  try {
    ClientCtor = require('pg').Client;
  } catch {
    const payload = {
      phase: 'P2.GEO-2',
      status: 'FAIL',
      message: 'pg package is required when GEODATA_DATABASE_URL is configured.',
      testCoordinate: TEST_COORDINATE,
      generatedAt: new Date().toISOString(),
    };
    writeProof(payload, '# P2.GEO-2 Kayseri Signal Results\n\nStatus: FAIL\n\nReason: pg package is required when GEODATA_DATABASE_URL is configured.');
    console.log(JSON.stringify({ status: payload.status, proof: 'proof/p2-geo-2-kayseri-signal-results.json' }, null, 2));
    process.exit(1);
  }

  const client = new ClientCtor({ connectionString: geodataDatabaseUrl });

  try {
    await client.connect();

    const extCheck = await client.query("SELECT extname FROM pg_extension WHERE extname = 'postgis' LIMIT 1");
    if (!extCheck.rows.length) {
      const payload = {
        phase: 'P2.GEO-2',
        status: 'FAIL',
        message: 'PostGIS extension is not enabled on target database.',
        testCoordinate: TEST_COORDINATE,
        generatedAt: new Date().toISOString(),
      };
      writeProof(payload, '# P2.GEO-2 Kayseri Signal Results\n\nStatus: FAIL\n\nReason: PostGIS extension is not enabled.');
      console.log(JSON.stringify({ status: payload.status, proof: 'proof/p2-geo-2-kayseri-signal-results.json' }, null, 2));
      process.exit(1);
    }

    const nearestAdmin = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      )
      SELECT a.name, a.centerType, a.confidence,
             ST_Distance(a.geom::geography, ip.geog) AS distance_m,
             s.sourceName, s.versionHash
      FROM geo_admin_centers a
      JOIN geo_source_versions s ON s.id = a.sourceVersionId
      CROSS JOIN input_point ip
      ORDER BY ST_Distance(a.geom::geography, ip.geog)
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const nearestRoad = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      )
      SELECT r.name, r.highwayType, r.confidence,
             ST_Distance(r.geom::geography, ip.geog) AS distance_m,
             s.sourceName, s.versionHash
      FROM geo_roads_major r
      JOIN geo_source_versions s ON s.id = r.sourceVersionId
      CROSS JOIN input_point ip
      ORDER BY ST_Distance(r.geom::geography, ip.geog)
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const nearestSettlement = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      )
      SELECT p.name, p.placeType, p.confidence,
             ST_Distance(p.geom::geography, ip.geog) AS distance_m,
             s.sourceName, s.versionHash
      FROM geo_places p
      JOIN geo_source_versions s ON s.id = p.sourceVersionId
      CROSS JOIN input_point ip
      ORDER BY ST_Distance(p.geom::geography, ip.geog)
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const nearestIndustrial = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      ),
      industrial_candidates AS (
        SELECT i.name AS name,
               i.confidence AS confidence,
               'geo_industrial_areas'::text AS source_table,
               ST_Distance(i.geom::geography, ip.geog) AS distance_m,
               s.sourceName AS source_name,
               s.versionHash AS version_hash
        FROM geo_industrial_areas i
        JOIN geo_source_versions s ON s.id = i.sourceVersionId
        CROSS JOIN input_point ip

        UNION ALL

        SELECT o.name AS name,
               o.confidence AS confidence,
               'geo_osb_curated'::text AS source_table,
               ST_Distance(o.geom::geography, ip.geog) AS distance_m,
               o.source AS source_name,
               'p2-geo-2-osb-curated'::text AS version_hash
        FROM geo_osb_curated o
        CROSS JOIN input_point ip
      )
      SELECT *
      FROM industrial_candidates
      ORDER BY distance_m ASC
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const nearestWater = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      )
      SELECT w.name, w.waterType, w.confidence,
             ST_Distance(w.geom::geography, ip.geog) AS distance_m,
             s.sourceName, s.versionHash
      FROM geo_water_features w
      JOIN geo_source_versions s ON s.id = w.sourceVersionId
      CROSS JOIN input_point ip
      ORDER BY ST_Distance(w.geom::geography, ip.geog)
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const nearestTourism = await client.query(
      `
      WITH input_point AS (
        SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
      )
      SELECT t.name, t.tourismType, t.confidence,
             ST_Distance(t.geom::geography, ip.geog) AS distance_m,
             s.sourceName, s.versionHash
      FROM geo_tourism_features t
      JOIN geo_source_versions s ON s.id = t.sourceVersionId
      CROSS JOIN input_point ip
      ORDER BY ST_Distance(t.geom::geography, ip.geog)
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const terrainRow = await client.query(
      `
      SELECT e.elevationM, e.slopeSignal, e.source, e.sourceVersion,
             sqrt(power(e.lat - $2, 2) + power(e.lon - $1, 2)) AS pseudo_distance
      FROM geo_elevation_cache e
      ORDER BY pseudo_distance ASC
      LIMIT 1;
      `,
      [TEST_COORDINATE.lon, TEST_COORDINATE.lat]
    );

    const signals: SignalRecord[] = [];

    const admin = nearestAdmin.rows[0];
    if (admin) {
      signals.push({
        type: 'NEAREST_DISTRICT_CENTER',
        value: String(admin.name),
        distanceKm: toKm(admin.distance_m),
        source: String(admin.sourcename || admin.sourceName),
        sourceVersion: rowSourceVersion(admin),
        confidence: String(admin.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const road = nearestRoad.rows[0];
    if (road) {
      signals.push({
        type: 'NEAREST_MAIN_ROAD',
        value: `${String(road.name)} (${String(road.highwaytype || road.highwayType)})`,
        distanceKm: toKm(road.distance_m),
        source: String(road.sourcename || road.sourceName),
        sourceVersion: rowSourceVersion(road),
        confidence: String(road.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const settlement = nearestSettlement.rows[0];
    if (settlement) {
      signals.push({
        type: 'NEAREST_SETTLEMENT',
        value: `${String(settlement.name)} (${String(settlement.placetype || settlement.placeType)})`,
        distanceKm: toKm(settlement.distance_m),
        source: String(settlement.sourcename || settlement.sourceName),
        sourceVersion: rowSourceVersion(settlement),
        confidence: String(settlement.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const industrial = nearestIndustrial.rows[0];
    if (industrial) {
      signals.push({
        type: 'INDUSTRIAL_OR_OSB_PROXIMITY',
        value: `${String(industrial.name)} (${String(industrial.source_table)})`,
        distanceKm: toKm(industrial.distance_m),
        source: String(industrial.source_name),
        sourceVersion: String(industrial.version_hash || 'unknown-source-version'),
        confidence: String(industrial.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const water = nearestWater.rows[0];
    if (water) {
      signals.push({
        type: 'WATER_OR_COAST_PROXIMITY',
        value: `${String(water.name)} (${String(water.watertype || water.waterType)})`,
        distanceKm: toKm(water.distance_m),
        source: String(water.sourcename || water.sourceName),
        sourceVersion: rowSourceVersion(water),
        confidence: String(water.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const tourism = nearestTourism.rows[0];
    if (tourism) {
      signals.push({
        type: 'TOURISM_PROXIMITY',
        value: `${String(tourism.name)} (${String(tourism.tourismtype || tourism.tourismType)})`,
        distanceKm: toKm(tourism.distance_m),
        source: String(tourism.sourcename || tourism.sourceName),
        sourceVersion: rowSourceVersion(tourism),
        confidence: String(tourism.confidence || 'POC_ONLY_LOW'),
        officialVerification: false,
        label: 'PUBLIC_SOURCE_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    const terrain = terrainRow.rows[0];
    if (terrain) {
      signals.push({
        type: 'TERRAIN_ELEVATION',
        value: `elevation=${String(terrain.elevationm || terrain.elevationM)}m slope=${String(terrain.slopesignal || terrain.slopeSignal)}`,
        distanceKm: null,
        source: String(terrain.source),
        sourceVersion: String(terrain.sourceversion || terrain.sourceVersion),
        confidence: 'POC_ONLY_LOW',
        officialVerification: false,
        label: 'TERRAIN_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    } else {
      signals.push({
        type: 'TERRAIN_ELEVATION',
        value: 'P2_1B_TRIAGED_BACKLOG-no-elevation-cache-row',
        distanceKm: null,
        source: 'P2_GEO_2_MANUAL_POC',
        sourceVersion: 'p2-geo-2-P2_1B_TRIAGED_BACKLOG',
        confidence: 'POC_ONLY_LOW',
        officialVerification: false,
        label: 'TERRAIN_SIGNAL',
        disclaimer: BASE_DISCLAIMER,
      });
    }

    signals.push({
      type: 'HAZARD_CONTEXT_PLACEHOLDER',
      value: 'AFAD/DASK context layer not enabled in this POC',
      distanceKm: null,
      source: 'P2_GEO_2_MANUAL_POC',
      sourceVersion: 'p2-geo-2-P2_1B_TRIAGED_BACKLOG',
      confidence: 'POC_ONLY_LOW',
      officialVerification: false,
      label: 'NEEDS_OFFICIAL_CONFIRMATION',
      disclaimer: BASE_DISCLAIMER,
    });

    const payload = {
      phase: 'P2.GEO-2',
      status: 'PASS',
      testCoordinate: TEST_COORDINATE,
      signalCount: signals.length,
      signals,
      generatedAt: new Date().toISOString(),
    };

    const markdown = [
      '# P2.GEO-2 Kayseri Signal Results',
      '',
      '## Status',
      '- PASS',
      '',
      '## Test Coordinate',
      `- ${TEST_COORDINATE.location} (${TEST_COORDINATE.lat}, ${TEST_COORDINATE.lon})`,
      '',
      '## Signals',
      ...signals.map(
        (signal) =>
          `- ${signal.type}: ${signal.value} | distanceKm=${signal.distanceKm ?? '-'} | label=${signal.label} | officialVerification=false`
      ),
      '',
      '## Disclaimer',
      `- ${BASE_DISCLAIMER}`,
    ].join('\n');

    writeProof(payload, markdown);
    console.log(JSON.stringify({ status: payload.status, proof: 'proof/p2-geo-2-kayseri-signal-results.json' }, null, 2));
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown query error';
    const payload = {
      phase: 'P2.GEO-2',
      status: 'FAIL',
      message: detail,
      testCoordinate: TEST_COORDINATE,
      generatedAt: new Date().toISOString(),
    };
    writeProof(payload, `# P2.GEO-2 Kayseri Signal Results\n\n## Status\n- FAIL\n\n## Reason\n- ${detail}`);
    console.log(JSON.stringify({ status: payload.status, proof: 'proof/p2-geo-2-kayseri-signal-results.json' }, null, 2));
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
