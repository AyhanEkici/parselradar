type SeedStatus = 'SEEDED' | 'CONFIG_REQUIRED' | 'FAILED';

function logResult(status: SeedStatus, detail: string) {
  console.log(
    JSON.stringify(
      {
        phase: 'P2.GEO-2',
        step: 'seed-kayseri-poc',
        status,
        detail,
      },
      null,
      2
    )
  );
}

async function main() {
  const geodataDatabaseUrl = String(process.env.GEODATA_DATABASE_URL || '').trim();
  if (!geodataDatabaseUrl) {
    logResult('CONFIG_REQUIRED', 'GEODATA_DATABASE_URL is missing. Seed was skipped.');
    process.exit(0);
  }

  let ClientCtor: any;
  try {
    ClientCtor = require('pg').Client;
  } catch {
    logResult('FAILED', 'pg package is required when GEODATA_DATABASE_URL is configured.');
    process.exit(1);
  }

  const client = new ClientCtor({ connectionString: geodataDatabaseUrl });

  try {
    await client.connect();
    await client.query('BEGIN');

    const source = {
      sourceName: 'P2_GEO_2_MANUAL_POC',
      sourceUrl: 'https://download.geofabrik.de/europe/turkey.html',
      sourceLicense: 'POC_ONLY_NOT_PRODUCTION',
      sourceUseLabel: 'PUBLIC_SOURCE_SIGNAL',
      officialVerification: false,
      extractDate: '2026-05-25T00:00:00.000Z',
      versionHash: 'p2-geo-2-kayseri-seed-v1',
      notes: 'Approximate manual POC coordinates for Kayseri query mechanics only.',
    };

    const sourceVersionResult = await client.query(
      `
      INSERT INTO geo_source_versions
        (sourceName, sourceUrl, sourceLicense, sourceUseLabel, officialVerification, extractDate, versionHash, notes)
      VALUES
        ($1, $2, $3, $4, $5, $6::timestamptz, $7, $8)
      ON CONFLICT (versionHash)
      DO UPDATE SET
        sourceName = EXCLUDED.sourceName,
        sourceUrl = EXCLUDED.sourceUrl,
        sourceLicense = EXCLUDED.sourceLicense,
        sourceUseLabel = EXCLUDED.sourceUseLabel,
        officialVerification = EXCLUDED.officialVerification,
        extractDate = EXCLUDED.extractDate,
        notes = EXCLUDED.notes
      RETURNING id;
      `,
      [
        source.sourceName,
        source.sourceUrl,
        source.sourceLicense,
        source.sourceUseLabel,
        source.officialVerification,
        source.extractDate,
        source.versionHash,
        source.notes,
      ]
    );
    const sourceVersionId = Number(sourceVersionResult.rows[0].id);

    await client.query('DELETE FROM geo_admin_centers WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query('DELETE FROM geo_places WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query('DELETE FROM geo_roads_major WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query('DELETE FROM geo_industrial_areas WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query('DELETE FROM geo_water_features WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query('DELETE FROM geo_tourism_features WHERE sourceVersionId = $1', [sourceVersionId]);
    await client.query("DELETE FROM geo_osb_curated WHERE source = 'P2_GEO_2_MANUAL_POC'");
    await client.query("DELETE FROM geo_elevation_cache WHERE source = 'P2_GEO_2_MANUAL_POC'");

    await client.query(
      `
      INSERT INTO geo_admin_centers (name, centerType, province, district, confidence, geom, sourceVersionId)
      VALUES
        ('Kayseri Merkez (POC)', 'PROVINCE_CENTER', 'Kayseri', 'Kocasinan', 'POC_ONLY_LOW', ST_SetSRID(ST_MakePoint(35.4875, 38.7225), 4326), $1),
        ('Talas Merkez (POC)', 'DISTRICT_CENTER', 'Kayseri', 'Talas', 'POC_ONLY_LOW', ST_SetSRID(ST_MakePoint(35.5530, 38.6900), 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_places (osmId, name, placeType, adminLevel, province, district, confidence, geom, sourceVersionId)
      VALUES
        ('POC-PLACE-001', 'Endurluk Koyu (POC)', 'village', '8', 'Kayseri', 'Talas', 'POC_ONLY_LOW', ST_SetSRID(ST_MakePoint(35.5200, 38.6700), 4326), $1),
        ('POC-PLACE-002', 'Kayseri Merkez Yerlesim (POC)', 'settlement', '6', 'Kayseri', 'Kocasinan', 'POC_ONLY_LOW', ST_SetSRID(ST_MakePoint(35.4900, 38.7250), 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_roads_major (osmId, name, highwayType, confidence, geom, sourceVersionId)
      VALUES
        ('POC-ROAD-001', 'D300 POC Segment', 'trunk', 'POC_ONLY_LOW', ST_GeomFromText('LINESTRING(35.4300 38.7000, 35.6200 38.7200)', 4326), $1),
        ('POC-ROAD-002', 'Kayseri Ring POC Segment', 'primary', 'POC_ONLY_LOW', ST_GeomFromText('LINESTRING(35.4500 38.7600, 35.5600 38.6600)', 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_industrial_areas (osmId, name, industrialType, isOsbCandidate, confidence, geom, sourceVersionId)
      VALUES
        ('POC-IND-001', 'Kayseri OSB Candidate Polygon (POC)', 'industrial_zone', true, 'POC_ONLY_LOW', ST_GeomFromText('POLYGON((35.3000 38.7600, 35.3400 38.7600, 35.3400 38.7300, 35.3000 38.7300, 35.3000 38.7600))', 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_osb_curated (name, province, district, geom, source, confidence, verifiedAt, notes)
      VALUES
        ('Kayseri OSB Curated Candidate (POC)', 'Kayseri', 'Kocasinan', ST_SetSRID(ST_MakePoint(35.3200, 38.7450), 4326), 'P2_GEO_2_MANUAL_POC', 'POC_ONLY_LOW', NOW(), 'Approximate curated POC location only.');
      `
    );

    await client.query(
      `
      INSERT INTO geo_water_features (osmId, name, waterType, confidence, geom, sourceVersionId)
      VALUES
        ('POC-WATER-001', 'Yamula Baraji Candidate (POC)', 'reservoir', 'POC_ONLY_LOW', ST_GeomFromText('POLYGON((35.4300 38.9400, 35.5000 38.9400, 35.5000 38.8800, 35.4300 38.8800, 35.4300 38.9400))', 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_tourism_features (osmId, name, tourismType, confidence, geom, sourceVersionId)
      VALUES
        ('POC-TOUR-001', 'Erciyes Kayak Merkezi Candidate (POC)', 'ski_resort', 'POC_ONLY_LOW', ST_SetSRID(ST_MakePoint(35.4540, 38.5340), 4326), $1);
      `,
      [sourceVersionId]
    );

    await client.query(
      `
      INSERT INTO geo_elevation_cache (lat, lon, elevationM, slopeSignal, source, sourceVersion, computedAt)
      VALUES
        (38.7100, 35.5000, 1110, 'LOW_TO_MEDIUM_SLOPE_POC', 'P2_GEO_2_MANUAL_POC', 'p2-geo-2-kayseri-seed-v1', NOW());
      `
    );

    await client.query('COMMIT');
    logResult('SEEDED', 'Kayseri POC geodata seed inserted successfully.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    const detail = error instanceof Error ? error.message : 'Unknown seed error';
    logResult('FAILED', detail);
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
