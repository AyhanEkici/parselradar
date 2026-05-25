import fs from 'fs';
import path from 'path';

type Status = 'APPLIED' | 'CONFIG_REQUIRED' | 'FAILED';

function logResult(status: Status, detail: string) {
  console.log(
    JSON.stringify(
      {
        phase: 'P2.GEO-2',
        step: 'apply-schema',
        status,
        detail,
        sqlFile: 'apps/api/scripts/geodata/sql/p2_geo_2_kayseri_schema.sql',
      },
      null,
      2
    )
  );
}

async function main() {
  const geodataDatabaseUrl = String(process.env.GEODATA_DATABASE_URL || '').trim();
  if (!geodataDatabaseUrl) {
    logResult('CONFIG_REQUIRED', 'GEODATA_DATABASE_URL is missing. Schema was not applied.');
    process.exit(0);
  }

  const sqlPath = path.join(process.cwd(), 'apps/api/scripts/geodata/sql/p2_geo_2_kayseri_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    logResult('FAILED', `Schema SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

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
    await client.query(sql);
    logResult('APPLIED', 'Kayseri POC PostGIS schema applied successfully.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown schema apply error';
    logResult('FAILED', detail);
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
