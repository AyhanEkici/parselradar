export type EvidenceSourceType =
  | "LISTING"
  | "TKGM_PUBLIC_CHECK"
  | "MUNICIPAL_E_IMAR_CHECK"
  | "USER_NOTE"
  | "OTHER_PUBLIC_SOURCE";

export type EvidenceInputType =
  | "TEXT"
  | "URL"
  | "IMAGE"
  | "PDF"
  | "SCREENSHOT"
  | "UNKNOWN";

export type EvidenceExtractionStatus =
  | "TEXT_EXTRACTED"
  | "OCR_ENGINE_NOT_CONFIGURED"
  | "TEXT_EXTRACTION_UNAVAILABLE"
  | "EMPTY_INPUT"
  | "UNSUPPORTED_INPUT";

export type RequiredPropertyField =
  | "province"
  | "district"
  | "neighborhood"
  | "areaM2"
  | "askingPriceTry";

export const MVP4D_REQUIRED_PROPERTY_FIELDS: RequiredPropertyField[] = [
  "province",
  "district",
  "neighborhood",
  "areaM2",
  "askingPriceTry",
];

export const MVP4D_EVIDENCE_DISCLAIMER =
  "Evidence OCR/extraction is informational only. It is not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.";

export interface EvidenceInput {
  propertyId?: string;
  listingId?: string;
  sourceType?: EvidenceSourceType;
  inputType: EvidenceInputType;
  rawText?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  declaredFields?: Partial<Record<RequiredPropertyField, string | number | null | undefined>>;
}

export interface EvidenceRecord {
  id: string;
  propertyId?: string;
  listingId?: string;
  sourceType: EvidenceSourceType;
  inputType: EvidenceInputType;
  extractedText: string;
  extractionStatus: EvidenceExtractionStatus;
  extractionConfidence: number;
  missingRequiredFields: RequiredPropertyField[];
  officialVerification: false;
  disclaimer: string;
  createdAt: string;
}

export interface BasicRiskScanReadiness {
  ready: boolean;
  missingRequiredFields: RequiredPropertyField[];
  label: "READY_FOR_BASIC_RISK_SCAN" | "VUL_ONTBREKENDE_DATA";
}

function stableHash(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasFieldValue(value: string | number | null | undefined): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return normalizeText(value).length > 0;
}

export function classifyEvidenceSourceType(input: Pick<EvidenceInput, "url" | "rawText" | "sourceType">): EvidenceSourceType {
  if (input.sourceType) return input.sourceType;

  const haystack = `${input.url ?? ""} ${input.rawText ?? ""}`.toLowerCase();

  if (haystack.includes("tkgm") || haystack.includes("parselsorgu") || haystack.includes("tapu")) {
    return "TKGM_PUBLIC_CHECK";
  }

  if (haystack.includes("e-imar") || haystack.includes("e imar") || haystack.includes("belediye") || haystack.includes("imar")) {
    return "MUNICIPAL_E_IMAR_CHECK";
  }

  if (haystack.includes("sahibinden") || haystack.includes("emlakjet") || haystack.includes("hepsiemlak") || haystack.includes("zingat")) {
    return "LISTING";
  }

  if (!input.url && input.rawText) {
    return "USER_NOTE";
  }

  return "OTHER_PUBLIC_SOURCE";
}

export function getMissingRequiredFields(
  fields: Partial<Record<RequiredPropertyField, string | number | null | undefined>> = {},
): RequiredPropertyField[] {
  return MVP4D_REQUIRED_PROPERTY_FIELDS.filter((field) => !hasFieldValue(fields[field]));
}

export function createEvidenceRecord(input: EvidenceInput): EvidenceRecord {
  const extractedText = normalizeText(input.rawText);
  const sourceType = classifyEvidenceSourceType(input);
  const missingRequiredFields = getMissingRequiredFields(input.declaredFields);

  let extractionStatus: EvidenceExtractionStatus = "TEXT_EXTRACTION_UNAVAILABLE";
  let extractionConfidence = 0;

  if (input.inputType === "TEXT" && extractedText.length > 0) {
    extractionStatus = "TEXT_EXTRACTED";
    extractionConfidence = 0.95;
  } else if ((input.inputType === "PDF" || input.inputType === "URL") && extractedText.length > 0) {
    extractionStatus = "TEXT_EXTRACTED";
    extractionConfidence = 0.8;
  } else if (input.inputType === "IMAGE" || input.inputType === "SCREENSHOT") {
    extractionStatus = "OCR_ENGINE_NOT_CONFIGURED";
    extractionConfidence = 0;
  } else if (extractedText.length === 0) {
    extractionStatus = "EMPTY_INPUT";
    extractionConfidence = 0;
  } else {
    extractionStatus = "UNSUPPORTED_INPUT";
    extractionConfidence = 0;
  }

  const idSeed = [
    input.propertyId ?? "",
    input.listingId ?? "",
    sourceType,
    input.inputType,
    input.url ?? "",
    input.fileName ?? "",
    extractedText,
  ].join("|");

  return {
    id: `evidence_${stableHash(idSeed)}`,
    propertyId: input.propertyId,
    listingId: input.listingId,
    sourceType,
    inputType: input.inputType,
    extractedText,
    extractionStatus,
    extractionConfidence,
    missingRequiredFields,
    officialVerification: false,
    disclaimer: MVP4D_EVIDENCE_DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
}

export function getBasicRiskScanReadiness(
  fields: Partial<Record<RequiredPropertyField, string | number | null | undefined>> = {},
): BasicRiskScanReadiness {
  const missingRequiredFields = getMissingRequiredFields(fields);

  return {
    ready: missingRequiredFields.length === 0,
    missingRequiredFields,
    label: missingRequiredFields.length === 0 ? "READY_FOR_BASIC_RISK_SCAN" : "VUL_ONTBREKENDE_DATA",
  };
}
