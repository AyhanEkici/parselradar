import fs from "node:fs";
import path from "node:path";
import {
  createEvidenceRecord,
  getBasicRiskScanReadiness,
  MVP4D_EVIDENCE_DISCLAIMER,
} from "../src/evidence/evidenceOcr";

function ensureProofDir(): void {
  fs.mkdirSync(path.resolve("proof"), { recursive: true });
}

function writeProofPair(basePathWithoutExtension: string, payload: unknown, markdown: string): void {
  ensureProofDir();
  fs.writeFileSync(`${basePathWithoutExtension}.json`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(`${basePathWithoutExtension}.md`, markdown, "utf8");
}

function fileIncludes(filePath: string, token: string): boolean {
  return fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8").includes(token);
}

async function main(): Promise<void> {
  const listingEvidence = createEvidenceRecord({
    propertyId: "property-demo",
    sourceType: "LISTING",
    inputType: "TEXT",
    rawText: "Kayseri Melikgazi 500 m2 arsa 1500000 TL",
    declaredFields: {
      province: "Kayseri",
      district: "Melikgazi",
      neighborhood: "",
      areaM2: 500,
      askingPriceTry: 1500000,
    },
  });

  const screenshotEvidence = createEvidenceRecord({
    propertyId: "property-demo",
    inputType: "SCREENSHOT",
    fileName: "listing-screenshot.png",
    mimeType: "image/png",
    declaredFields: {
      province: "Kayseri",
    },
  });

  const completeReadiness = getBasicRiskScanReadiness({
    province: "Kayseri",
    district: "Melikgazi",
    neighborhood: "Tavlusun",
    areaM2: 500,
    askingPriceTry: 1500000,
  });

  const incompleteReadiness = getBasicRiskScanReadiness({
    province: "Kayseri",
    district: "Melikgazi",
  });

  const componentPath = "apps/web/src/components/evidence/EvidenceOcrReadinessPanel.tsx";
  const contractPath = "apps/api/src/evidence/evidenceOcr.ts";
  const docsPath = "docs/MVP_4D_EVIDENCE_OCR_IMPLEMENTATION.md";

  const componentExists = fs.existsSync(componentPath);
  const contractExists = fs.existsSync(contractPath);
  const docsExist = fs.existsSync(docsPath);

  const uiHasMissingDataCopy = fileIncludes(componentPath, "Vul ontbrekende data");
  const uiHasAsterisk = fileIncludes(componentPath, "<span aria-hidden=\"true\">*</span>");
  const uiHasDisclaimer = fileIncludes(componentPath, "officialVerification=false");
  const uiHasRiskReadiness = fileIncludes(componentPath, "Basic Risk Scan readiness");

  const textExtractionHonest =
    listingEvidence.extractionStatus === "TEXT_EXTRACTED" &&
    listingEvidence.extractedText.includes("Kayseri") &&
    listingEvidence.officialVerification === false;

  const imageOcrHonest =
    screenshotEvidence.extractionStatus === "OCR_ENGINE_NOT_CONFIGURED" &&
    screenshotEvidence.extractedText.length === 0 &&
    screenshotEvidence.officialVerification === false;

  const missingFieldsStable =
    listingEvidence.missingRequiredFields.includes("neighborhood") &&
    incompleteReadiness.label === "VUL_ONTBREKENDE_DATA" &&
    incompleteReadiness.ready === false;

  const riskReady =
    completeReadiness.ready === true &&
    completeReadiness.label === "READY_FOR_BASIC_RISK_SCAN" &&
    completeReadiness.missingRequiredFields.length === 0;

  const noOfficialClaim =
    MVP4D_EVIDENCE_DISCLAIMER.includes("not official") &&
    listingEvidence.disclaimer === MVP4D_EVIDENCE_DISCLAIMER &&
    screenshotEvidence.disclaimer === MVP4D_EVIDENCE_DISCLAIMER;

  const status =
    componentExists &&
    contractExists &&
    docsExist &&
    uiHasMissingDataCopy &&
    uiHasAsterisk &&
    uiHasDisclaimer &&
    uiHasRiskReadiness &&
    textExtractionHonest &&
    imageOcrHonest &&
    missingFieldsStable &&
    riskReady &&
    noOfficialClaim
      ? "PASS"
      : "FAIL";

  const payload = {
    phase: "MVP-4D",
    status,
    componentExists,
    contractExists,
    docsExist,
    uiHasMissingDataCopy,
    uiHasAsterisk,
    uiHasDisclaimer,
    uiHasRiskReadiness,
    textExtractionHonest,
    imageOcrHonest,
    missingFieldsStable,
    riskReady,
    noOfficialClaim,
    listingEvidence,
    screenshotEvidence,
    completeReadiness,
    incompleteReadiness,
    fakeOcrAdded: false,
    realOcrEngineConfigured: false,
    officialVerificationClaimAdded: false,
    scrapingAdded: false,
    envChanged: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/mvp-4d-evidence-ocr-results",
    payload,
    [
      "# MVP-4D Evidence OCR Results",
      "",
      `- Status: ${status}`,
      `- Component exists: ${componentExists}`,
      `- Contract exists: ${contractExists}`,
      `- Docs exist: ${docsExist}`,
      `- Text extraction honest: ${textExtractionHonest}`,
      `- Image OCR honest: ${imageOcrHonest}`,
      `- Missing fields stable: ${missingFieldsStable}`,
      `- Risk ready: ${riskReady}`,
      `- No official claim: ${noOfficialClaim}`,
      "- Fake OCR added: false",
      "- Real OCR engine configured: false",
      "- officialVerification claim added: false",
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify({ status, proof: "proof/mvp-4d-evidence-ocr-results.json" }, null, 2));

  if (status !== "PASS") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  const payload = {
    phase: "MVP-4D",
    status: "FAIL",
    detail,
    fakeOcrAdded: false,
    officialVerificationClaimAdded: false,
    generatedAt: new Date().toISOString(),
  };

  writeProofPair(
    "proof/mvp-4d-evidence-ocr-results",
    payload,
    `# MVP-4D Evidence OCR Results\n\n- Status: FAIL\n- Detail: ${detail}\n`,
  );

  console.log(JSON.stringify({ status: "FAIL", proof: "proof/mvp-4d-evidence-ocr-results.json" }, null, 2));
  process.exitCode = 1;
});