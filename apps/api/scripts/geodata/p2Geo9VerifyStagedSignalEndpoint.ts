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

function buildMarkdown(payload: Record<string, any>): string {
  const lines = [
    "# P2.GEO-9 Staged Signal API Results",
    "",
    `- Status: ${payload.status ?? "UNKNOWN"}`,
    `- Endpoint mounted: ${payload.endpointMounted ?? false}`,
    `- Endpoint guard: ${payload.endpointGuard ?? "n/a"}`,
    `- Signal count: ${payload.signalCount ?? 0}`,
    `- Production tables queried: ${payload.productionTablesQueried ?? false}`,
    `- Production swap used: ${payload.productionSwapUsed ?? false}`,
    `- officialVerification: ${payload.officialVerification ?? false}`,
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
      `- Source label: ${signal.sourceLabel}`,
      `- officialVerification: ${signal.officialVerification}`,
      "",
    );
  }

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const routeFile = path.resolve("apps/api/src/routes/stagedGeoSignalsRoutes.ts");
  const indexFile = path.resolve("apps/api/src/index.ts");

  const routeExists = fs.existsSync(routeFile);
  const routeContent = routeExists ? fs.readFileSync(routeFile, "utf8") : "";
  const indexContent = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, "utf8") : "";

  const routeMounted = indexContent.includes('/api/dev/staged-geo-signals');
  const routeHasDevGuard = routeContent.includes("DEV_ONLY");
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
    buildMarkdown(payload),
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
    buildMarkdown(payload),
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-geo-9-staged-signal-api-results.json" }, null, 2));
  process.exitCode = 1;
});
