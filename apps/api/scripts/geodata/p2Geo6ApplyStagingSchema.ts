import fs from "node:fs";
import path from "node:path";
import {
  readP2Geo6Config,
  safeConfigForProof,
  writeProofPair,
} from "./p2Geo6StagedImportConfig";

async function main(): Promise<void> {
  const config = readP2Geo6Config();
  const safeConfig = safeConfigForProof(config);
  const sqlFile = path.resolve("apps/api/scripts/geodata/sql/p2_geo_6_staging_tables.sql");

  if (!config.geodataDatabaseUrlPresent) {
    const payload = {
      phase: "P2.GEO-6",
      step: "apply-staging-schema",
      generatedAt: new Date().toISOString(),
      ...safeConfig,
      status: "CONFIG_REQUIRED",
      detail: "GEODATA_DATABASE_URL is missing.",
      sqlFile,
    };

    writeProofPair(
      "proof/p2-geo-6-staging-schema-results",
      payload,
      "# P2.GEO-6 Staging Schema Results\n\n- Status: CONFIG_REQUIRED\n- Reason: GEODATA_DATABASE_URL is missing.\n",
    );

    console.log(JSON.stringify({ status: "CONFIG_REQUIRED", proof: "proof/p2-geo-6-staging-schema-results.json" }, null, 2));
    return;
  }

  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.GEODATA_DATABASE_URL });

  try {
    await client.connect();
    await client.query(fs.readFileSync(sqlFile, "utf8"));

    const payload = {
      phase: "P2.GEO-6",
      step: "apply-staging-schema",
      status: "STAGING_READY",
      detail: "P2.GEO-6 staging schema applied successfully.",
      sqlFile,
      productionSwapAllowed: false,
      officialVerification: false,
      generatedAt: new Date().toISOString(),
    };

    writeProofPair(
      "proof/p2-geo-6-staging-schema-results",
      payload,
      "# P2.GEO-6 Staging Schema Results\n\n- Status: STAGING_READY\n- Production swap allowed: false\n- Official verification: false\n",
    );

    console.log(JSON.stringify({ status: "STAGING_READY", proof: "proof/p2-geo-6-staging-schema-results.json" }, null, 2));
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);

  const payload = {
    phase: "P2.GEO-6",
    step: "apply-staging-schema",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-6-staging-schema-results",
    payload,
    `# P2.GEO-6 Staging Schema Results\n\n- Status: FAIL\n- Reason: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-6-staging-schema-results.json" }, null, 2));
  process.exitCode = 1;
});
