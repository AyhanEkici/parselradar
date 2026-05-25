import fs from "node:fs";
import path from "node:path";
import {
  buildStagedSignalMarkdown,
  queryStagedSignalsFromPostgis,
  writeProofPair,
} from "../../src/geodata/stagedSignalAdapter";

async function main(): Promise<void> {
  const routeFile = path.resolve("apps/api/src/routes/stagedGeoSignalsRoutes.ts");
  const indexFile = path.resolve("apps/api/src/index.ts");

  const routeExists = fs.existsSync(routeFile);
  const indexContent = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, "utf8") : "";
  const routeMounted = indexContent.includes('/api/dev/staged-geo-signals');
  const routeHasDevGuard = routeExists && fs.readFileSync(routeFile, "utf8").includes("DEV_ONLY");

  const queryResult = await queryStagedSignalsFromPostgis();

  const payload = {
    ...queryResult,
    endpointRouteCreated: routeExists,
    endpointMounted: routeMounted,
    endpointGuard: "DEV_ONLY",
    endpointHasDevGuard: routeHasDevGuard,
    endpointPath: "/api/dev/staged-geo-signals",
    adminOrDevGuard: routeHasDevGuard,
    productionSwapUsed: false,
    productionTablesQueried: false,
    officialVerification: false,
  };

  writeProofPair(
    "proof/p2-geo-9-staged-signal-api-results",
    payload,
    buildStagedSignalMarkdown(payload),
  );

  console.log(JSON.stringify({ status: payload.status, proof: "proof/p2-geo-9-staged-signal-api-results.json" }, null, 2));

  if (payload.status !== "PASS" || !routeExists || !routeMounted || !routeHasDevGuard) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const payload = {
    phase: "P2.GEO-9",
    status: "FAIL",
    detail: error instanceof Error ? error.message : String(error),
    endpointRouteCreated: false,
    endpointMounted: false,
    endpointGuard: "DEV_ONLY",
    productionSwapUsed: false,
    productionTablesQueried: false,
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-geo-9-staged-signal-api-results",
    payload,
    `# P2.GEO-9 Staged Signal API Results\n\n- Status: FAIL\n- Detail: ${payload.detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-9-staged-signal-api-results.json" }, null, 2));
  process.exitCode = 1;
});
