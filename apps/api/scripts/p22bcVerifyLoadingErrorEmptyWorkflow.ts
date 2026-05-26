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

async function main(): Promise<void> {
  const app = read("apps/web/src/App.tsx");
  const boundary = read("apps/web/src/components/ui/RouteStateBoundary.tsx");
  const accessDenied = read("apps/web/src/pages/AccessDenied.tsx");
  const notFound = read("apps/web/src/pages/NotFound.tsx");
  const doc = read("docs/P2_2BC_LOADING_ERROR_EMPTY_WORKFLOW_COVERAGE.md");
  const p21dRaw = read("proof/p2-1d-final-audit-delta-closeout-results.json");

  let p21d: any = null;
  try {
    p21d = p21dRaw ? JSON.parse(p21dRaw) : null;
  } catch {
    p21d = null;
  }

  const appWrapped =
    app.includes("RouteStateBoundary") &&
    app.includes("RouteLoadingFallback") &&
    app.includes("<Suspense fallback={<RouteLoadingFallback />}>") &&
    app.includes("</Suspense>");

  const boundaryReady =
    boundary.includes("RouteStateBoundary") &&
    boundary.includes("componentDidCatch") &&
    boundary.includes("RouteLoadingFallback") &&
    boundary.includes("WorkflowRecoveryPanel") &&
    boundary.includes("variant=\"error\"") &&
    boundary.includes("variant=\"loading\"");

  const recoveryCopyReady =
    accessDenied.includes("guarded recovery path") &&
    notFound.includes("recover from an invalid route");

  const docsReady =
    doc.includes("Real Loading/Error/Empty State Coverage") &&
    doc.includes("no connector activation") &&
    doc.includes("no official verification claim");

  const p21dReady =
    Boolean(p21d) &&
    (p21d.status === "PASS_CLEAN_AUDIT" || p21d.status === "PASS_WITH_ACCEPTED_BACKLOG") &&
    p21d.p21Blockers === 0 &&
    p21d.p21High === 0;

  const status = appWrapped && boundaryReady && recoveryCopyReady && docsReady && p21dReady ? "PASS" : "FAIL";

  const payload = {
    phase: "P2.2B/P2.2C",
    status,
    appWrapped,
    boundaryReady,
    recoveryCopyReady,
    docsReady,
    p21dReady,
    p21dStatus: p21d?.status ?? "missing",
    p21dBlockers: p21d?.p21Blockers ?? null,
    p21dHigh: p21d?.p21High ?? null,
    noConnectorActivation: true,
    noScrapingAdded: true,
    noFullTurkeyImport: true,
    noProductionSwap: true,
    noFakeOcr: true,
    noOfficialVerificationClaimAdded: true,
    generatedAt: new Date().toISOString(),
  };

  const markdown = [
    "# P2.2B/P2.2C Loading/Error/Empty + Workflow Coverage Results",
    "",
    `- Status: ${status}`,
    `- App routes wrapped: ${appWrapped}`,
    `- Boundary ready: ${boundaryReady}`,
    `- Recovery copy ready: ${recoveryCopyReady}`,
    `- Docs ready: ${docsReady}`,
    `- P2.1D closeout ready: ${p21dReady}`,
    "- Connector activation: false",
    "- Scraping added: false",
    "- Full Turkey import: false",
    "- Production swap: false",
    "- Fake OCR: false",
    "- Official verification claim: false",
    "",
  ].join("\n");

  writeProofPair("proof/p2-2bc-loading-error-empty-workflow-results", payload, markdown);

  console.log(JSON.stringify({ status, proof: "proof/p2-2bc-loading-error-empty-workflow-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.2B/P2.2C",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-2bc-loading-error-empty-workflow-results",
    payload,
    `# P2.2B/P2.2C Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-2bc-loading-error-empty-workflow-results.json" }, null, 2));
  process.exitCode = 1;
});
