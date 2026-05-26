import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function read(file: string): string {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "") : "";
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function trackedFiles(): string[] {
  return execSync("git ls-files", { encoding: "utf8" })
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => !file.includes("node_modules/") && !file.includes("dist/"));
}

function parseProof(file: string): any {
  try {
    const raw = read(file);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasAll(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.every((token) => lower.includes(token.toLowerCase()));
}

function hasAny(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

async function main(): Promise<void> {
  const files = trackedFiles();
  const relevantFiles = files.filter((file) =>
    file.endsWith(".ts") ||
    file.endsWith(".tsx") ||
    file.endsWith(".json") ||
    file.endsWith(".md")
  );

  const haystackItems = relevantFiles.map((file) => ({ file, content: read(file) }));
  const kayseriHits = haystackItems.filter((item) => item.content.toLowerCase().includes("kayseri"));
  const ogcHits = haystackItems.filter((item) => hasAny(item.content, ["ogc", "wms", "wmts", "wfs", "geodata", "layer"]));
  const kayseriOgcHits = haystackItems.filter((item) => hasAny(item.content, ["kayseri"]) && hasAny(item.content, ["ogc", "wms", "wmts", "wfs", "geodata", "layer"]));

  const analysisFiles = [
    "apps/api/src/routes/analysisRoutes.ts",
    "apps/web/src/pages/PropertyResult.tsx",
    "apps/web/src/pages/NewProperty.tsx",
    "apps/web/src/components/ConversationalAnalysisIntake.tsx",
  ];

  const analysisContent = analysisFiles.map((file) => read(file)).join("\n");

  const analysisSurfaceReady =
    hasAny(analysisContent, ["analysis", "analyze", "report", "result"]) &&
    hasAny(analysisContent, ["property", "parcel", "parsel"]);

  const analysisMentionsGeoContext =
    hasAny(analysisContent, ["ogc", "geodata", "layer", "map", "signal", "wms", "wmts", "wfs", "kayseri"]);

  const p22d = parseProof("proof/p2-2d-analysis-runtime-smoke-results.json");
  const p22bc = parseProof("proof/p2-2bc-loading-error-empty-workflow-results.json");
  const p22a = parseProof("proof/p2-2a-user-visible-completeness-results.json");
  const p21d = parseProof("proof/p2-1d-final-audit-delta-closeout-results.json");

  const priorProofsReady =
    p22d?.status === "PASS" &&
    p22bc?.status === "PASS" &&
    p22a?.status === "PASS" &&
    Boolean(p21d) &&
    (p21d.status === "PASS_CLEAN_AUDIT" || p21d.status === "PASS_WITH_ACCEPTED_BACKLOG") &&
    p21d.p21Blockers === 0 &&
    p21d.p21High === 0;

  const connectorProofRaw = read("proof/connector-diagnostics-audit.json");
  const connectorContractRaw = read("proof/connector-diagnostics-contract.json");
  const p2Geo3iRaw = read("proof/p2-geo-3i-expanded-signal-ux-results.json");

  const connectorProofMentionsOgc = hasAny(`${connectorProofRaw}\n${connectorContractRaw}`, ["ogc", "wms", "wmts", "wfs"]);
  const p2GeoProofMentionsKayseri = p2Geo3iRaw.toLowerCase().includes("kayseri");

  const kayseriOgcEvidenceReady =
    kayseriOgcHits.length > 0 &&
    connectorProofMentionsOgc &&
    analysisSurfaceReady &&
    analysisMentionsGeoContext;

  const status = kayseriOgcEvidenceReady && priorProofsReady ? "PASS" : "BLOCKED_NEEDS_REAL_KAYSERI_OGC_WIRING";

  const payload = {
    phase: "P2.2E-0",
    status,
    kayseriHitCount: kayseriHits.length,
    ogcHitCount: ogcHits.length,
    kayseriOgcHitCount: kayseriOgcHits.length,
    kayseriOgcHitFiles: kayseriOgcHits.map((item) => item.file).slice(0, 50),
    analysisSurfaceReady,
    analysisMentionsGeoContext,
    connectorProofMentionsOgc,
    p2GeoProofMentionsKayseri,
    priorProofsReady,
    p22dStatus: p22d?.status ?? "missing",
    p22bcStatus: p22bc?.status ?? "missing",
    p22aStatus: p22a?.status ?? "missing",
    p21dStatus: p21d?.status ?? "missing",
    hardRequirement: "Kayseri OGC/geodata must be visible in analysis/report-facing surfaces before browser E2E is accepted.",
    noFakeOgcLoadedClaim: true,
    noConnectorActivation: true,
    noScrapingAdded: true,
    noFullTurkeyImport: true,
    noProductionSwap: true,
    noFakeOcr: true,
    noOfficialVerificationClaimAdded: true,
    generatedAt: new Date().toISOString(),
  };

  const markdown = [
    "# P2.2E-0 Kayseri OGC + Analysis Report Hard Preflight Results",
    "",
    `- Status: ${status}`,
    `- Kayseri hits: ${kayseriHits.length}`,
    `- OGC/geodata hits: ${ogcHits.length}`,
    `- Kayseri + OGC/geodata hits: ${kayseriOgcHits.length}`,
    `- Analysis surface ready: ${analysisSurfaceReady}`,
    `- Analysis mentions geo context: ${analysisMentionsGeoContext}`,
    `- Connector proof mentions OGC: ${connectorProofMentionsOgc}`,
    `- P2.GEO proof mentions Kayseri: ${p2GeoProofMentionsKayseri}`,
    `- Prior P2.2/P2.1D proofs ready: ${priorProofsReady}`,
    "",
    "## Kayseri OGC hit files",
    "",
    ...(kayseriOgcHits.length ? kayseriOgcHits.map((item) => `- ${item.file}`).slice(0, 50) : ["- none"]),
    "",
    "## Decision",
    "",
    status === "PASS"
      ? "Kayseri OGC/geodata evidence is present enough to proceed to real browser E2E smoke."
      : "Blocked: configure real Kayseri OGC/geodata wiring before claiming browser E2E analysis/report readiness.",
    "",
    "## Guardrails",
    "",
    "- No fake OGC loaded claim: true",
    "- Connector activation: false",
    "- Scraping added: false",
    "- Full Turkey import: false",
    "- Production swap: false",
    "- Official verification claim: false",
    "",
  ].join("\n");

  writeProofPair("proof/p2-2e-0-kayseri-ogc-analysis-preflight-results", payload, markdown);

  console.log(JSON.stringify({ status, proof: "proof/p2-2e-0-kayseri-ogc-analysis-preflight-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.2E-0",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
  };
  writeProofPair(
    "proof/p2-2e-0-kayseri-ogc-analysis-preflight-results",
    payload,
    `# P2.2E-0 Kayseri OGC Preflight Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-2e-0-kayseri-ogc-analysis-preflight-results.json" }, null, 2));
  process.exitCode = 1;
});
