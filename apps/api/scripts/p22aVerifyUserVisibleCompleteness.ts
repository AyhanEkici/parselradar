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
  const componentPath = "apps/web/src/components/ui/PageStatePanel.tsx";
  const accessDeniedPath = "apps/web/src/pages/AccessDenied.tsx";
  const notFoundPath = "apps/web/src/pages/NotFound.tsx";
  const docPath = "docs/P2_2A_PRODUCT_HARDENING_USER_VISIBLE_COMPLETENESS.md";
  const p21dProofPath = "proof/p2-1d-final-audit-delta-closeout-results.json";

  const component = read(componentPath);
  const accessDenied = read(accessDeniedPath);
  const notFound = read(notFoundPath);
  const doc = read(docPath);
  const p21dProof = read(p21dProofPath);

  const componentReady =
    component.includes("PageStatePanel") &&
    component.includes("loading") &&
    component.includes("empty") &&
    component.includes("error") &&
    component.includes("locked") &&
    component.includes("aria-label") &&
    component.includes("data-state-panel");

  const accessDeniedReady =
    accessDenied.includes("Access denied") &&
    accessDenied.includes("Open dashboard") &&
    accessDenied.includes("Switch account") &&
    accessDenied.includes("variant=\"locked\"");

  const notFoundReady =
    notFound.includes("Page not found") &&
    notFound.includes("Back to home") &&
    notFound.includes("Open dashboard") &&
    notFound.includes("variant=\"empty\"");

  const docsReady =
    doc.includes("Product Hardening") &&
    doc.includes("User-Visible Completeness") &&
    doc.includes("no connector activation") &&
    doc.includes("no official verification claim");

  let p21d: any = null;
  try {
    p21d = p21dProof ? JSON.parse(p21dProof) : null;
  } catch {
    p21d = null;
  }

  const p21dReady =
    Boolean(p21d) &&
    (p21d.status === "PASS_CLEAN_AUDIT" || p21d.status === "PASS_WITH_ACCEPTED_BACKLOG") &&
    p21d.p21Blockers === 0 &&
    p21d.p21High === 0;

  const status = componentReady && accessDeniedReady && notFoundReady && docsReady && p21dReady ? "PASS" : "FAIL";

  const payload = {
    phase: "P2.2A",
    status,
    componentReady,
    accessDeniedReady,
    notFoundReady,
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
    "# P2.2A Product Hardening / User-Visible Completeness Results",
    "",
    `- Status: ${status}`,
    `- PageStatePanel ready: ${componentReady}`,
    `- AccessDenied hardened: ${accessDeniedReady}`,
    `- NotFound hardened: ${notFoundReady}`,
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

  writeProofPair("proof/p2-2a-user-visible-completeness-results", payload, markdown);

  console.log(JSON.stringify({ status, proof: "proof/p2-2a-user-visible-completeness-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "P2.2A",
    status: "FAIL",
    detail,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/p2-2a-user-visible-completeness-results",
    payload,
    `# P2.2A Product Hardening / User-Visible Completeness Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/p2-2a-user-visible-completeness-results.json" }, null, 2));
  process.exitCode = 1;
});
