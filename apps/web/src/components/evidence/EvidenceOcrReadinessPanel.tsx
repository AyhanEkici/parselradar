export type EvidenceOcrPanelStatus =
  | "TEXT_EXTRACTED"
  | "OCR_ENGINE_NOT_CONFIGURED"
  | "TEXT_EXTRACTION_UNAVAILABLE"
  | "EMPTY_INPUT"
  | "UNSUPPORTED_INPUT";

export interface EvidenceOcrReadinessPanelProps {
  extractionStatus: EvidenceOcrPanelStatus;
  extractedTextPreview?: string;
  missingRequiredFields: string[];
  basicRiskScanReady: boolean;
}

export function EvidenceOcrReadinessPanel({
  extractionStatus,
  extractedTextPreview = "",
  missingRequiredFields,
  basicRiskScanReady,
}: EvidenceOcrReadinessPanelProps) {
  const hasMissingFields = missingRequiredFields.length > 0;

  return (
    <section aria-label="Evidence OCR readiness" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MVP-4D Evidence OCR</p>
        <h2 className="text-lg font-semibold text-slate-950">Vul ontbrekende data</h2>
        <p className="text-sm text-slate-600">
          Evidence extraction is informational only and does not replace official source checks.
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-800">Extraction status</p>
        <p className="text-sm text-slate-600">{extractionStatus}</p>
      </div>

      {extractedTextPreview ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">Extracted text preview</p>
          <p className="mt-1 text-sm text-slate-600">{extractedTextPreview}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-800">Required missing fields</p>
        {hasMissingFields ? (
          <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
            {missingRequiredFields.map((field) => (
              <li key={field}>
                <span aria-hidden="true">*</span> {field}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Minimum data is complete.</p>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-slate-950 p-3 text-white">
        <p className="text-sm font-medium">Basic Risk Scan readiness</p>
        <p className="mt-1 text-sm">{basicRiskScanReady ? "READY_FOR_BASIC_RISK_SCAN" : "VUL_ONTBREKENDE_DATA"}</p>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        officialVerification=false. This is not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.
      </p>
    </section>
  );
}

export default EvidenceOcrReadinessPanel;