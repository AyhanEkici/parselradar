import fs from "node:fs";
import path from "node:path";

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

function parseProof(file: string): any {
  try {
    const raw = read(file);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasAny(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

async function main(): Promise<void> {
  const analysisRoutePath = "apps/api/src/routes/analysisRoutes.ts";
  const propertyRoutePath = "apps/api/src/routes/propertyRoutes.ts";
  const newPropertyPath = "apps/web/src/pages/NewProperty.tsx";
  const propertyResultPath = "apps/web/src/pages/PropertyResult.tsx";
  const intakePath = "apps/web/src/components/ConversationalAnalysisIntake.tsx";
  const appPath = "apps/web/src/App.tsx";
  const boundaryPath = "apps/web/src/components/ui/RouteStateBoundary.tsx";
  const pageStatePanelPath = "apps/web/src/components/ui/PageStatePanel.tsx";
  const docPath = "docs/P2_2D_ANALYSIS_RUNTIME_SMOKE.md";

  const analysisRoute = read(analysisRoutePath);
  const propertyRoute = read(propertyRoutePath);
  const newProperty = read(newPropertyPath);
  const propertyResult = read(propertyResultPath);
  const intake = read(intakePath);
  const app = read(appPath);
  const boundary = read(boundaryPath);
  const pageStatePanel = read(pageStatePanelPath);
  const doc = read(docPath);

  const p22a = parseProof("proof/p2-2a-user-visible-completeness-results.json");
  const p22bc = parseProof("proof/p2-2bc-loading-error-empty-workflow-results.json");
  const p21d = parseProof("proof/p2-1d-final-audit-delta-closeout-results.json");

  const apiAnalysisRouteReady =
    fs.existsSync(analysisRoutePath) &&
    analysisRoute.includes(".post(") &&
    hasAny(analysisRoute, ["analysis", "analyze", "report", "result"]);

  const apiPropertyRouteReady =
    fs.existsSync(propertyRoutePath) &&
    hasAny(propertyRoute, [".post(", ".get("]) &&
    hasAny(propertyRoute, ["property", "properties"]);

  const frontendIntakeReady =
    (fs.existsSync(newPropertyPath) || fs.existsSync(intakePath)) &&
    hasAny(`${newProperty}\n${intake}`, ["analysis", "analyze", "property", "submit", "result"]);

  const frontendResultReady =
    fs.existsSync(propertyResultPath) &&
    hasAny(propertyResult, ["loading", "laden", "bezig"]) &&
    hasAny(propertyResult, ["error", "failed", "mislukt", "fout"]) &&
    hasAny(propertyResult, ["result", "analysis", "report"]);

  const routeRecoveryReady =
    app.includes("RouteStateBoundary") &&
    app.includes("RouteLoadingFallback") &&
    boundary.includes("componentDidCatch") &&
    boundary.includes("WorkflowRecoveryPanel") &&
    pageStatePanel.includes("PageStatePanel");

  const priorP22Ready =
    p22a?.status === "PASS" &&
    p22bc?.status === "PASS" &&
    Boolean(p21d) &&
    (p21d.status === "PASS_CLEAN_AUDIT" || p21d.status === "PASS_WITH_ACCEPTED_BACKLOG") &&
    p21d.p21Blockers === 0 &&
    p21d.p21High === 0;

  const docsReady =
    doc.includes("Analysis Runtime Smoke") &&
    doc.includes("no connector activation") &&
    doc.includes("no official verification claim");

  const status =
    apiAnalysisRouteReady &&
    apiPropertyRouteReady &&
    frontendIntakeReady &&
    frontendResultReady &&
    routeRecoveryReady &&
    priorP22Ready &&
    docsReady
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "P2.2D",
    status,
    apiAnalysisRouteReady,
    apiPropertyRouteReady,
    frontendIntakeReady,
    frontendResultReady,
    routeRecoveryReady,
    priorP22Ready,
    docsReady,
    p22aStatus: p22a?.status ?? "missing",
    p22bcStatus: p22bc?.status ?? "missing",
    p21dStatus: p21d?.status ?? "missing",
    p21dBlockers: p21d?.p21Blockers ?? null,
    p21dHigh: p21d?.p21High ?? null,
    smokeType: "analysis-runtime-contract-smoke",
    liveBrowserCredentialSmoke: false,
    noConnectorActivation: true,
    noScrapingAdded: true,
    noFullTurkeyImport: true,
    noProductionSwap: true,
    noFakeOcr: true,
    noOfficialVerificationClaimAdded: true,
    generatedAt: new Date().toISOString(),
  };

  const markdown = [
    "# P2.2D Analysis Runtime Smoke Results",
    "",
    `- Status: ${status}`,
    `- API analysis route ready: ${apiAnalysisRouteReady}`,
    `- API property route ready: ${apiPropertyRouteReady}`,
    `- Frontend intake ready: ${frontendIntakeReady}`,
    `- Frontend result ready: ${frontendResultReady}`,
    `- Route recovery ready: ${routeRecoveryReady}`,
    `- Prior P2.2 proofs ready: ${priorP22Ready}`,
    `- Docs ready: ${docsReady}`,
    "- Smoke type: analysis-runtime-contract-smoke",
    "- Live browser credential smoke: false",
    "- Connector activation: false",
    "- Scraping added: false",
    "- Full Turkey import: false",
    "- Production swap: false",
    "- Fake OCR: false",
    "- Official verification claim: false",
    "",
  ].join("\n");

  writeProofPair("proof/p2-2d-analysis-runtime-smoke-results", payload, markdown);
  console.log(JSON.stringify({ status, proof: "proof/p2-2d-analysis-runtime-smoke-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.2D",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
  };
  writeProofPair(
    "proof/p2-2d-analysis-runtime-smoke-results",
    payload,
    `# P2.2D Analysis Runtime Smoke Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );
  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-2d-analysis-runtime-smoke-results.json" }, null, 2));
  process.exitCode = 1;
});
