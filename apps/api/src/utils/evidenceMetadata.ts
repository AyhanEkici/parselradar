export type EvidenceMetadataContract = {
  sourceLabel: string;
  sourceType: string;
  sourceStatus:
    | 'AVAILABLE'
    | 'NOT_AVAILABLE_YET'
    | 'MANUAL_CHECK_REQUIRED'
    | 'BLOCKED_SOURCE'
    | 'PERMISSION_REQUIRED';
  reviewStatus:
    | 'NOT_YET_REVIEWED'
    | 'MANUAL_REVIEW_REQUIRED'
    | 'REVIEWED_FOR_GUIDANCE'
    | 'INSUFFICIENT_EVIDENCE';
  confidenceLevel: 'LOW' | 'MEDIUM';
  manualActionRequired: boolean;
  manualActionHint: string;
  officialVerificationStatus:
    | 'NOT_OFFICIAL_VERIFICATION'
    | 'MANUAL_OFFICIAL_CHECK_REQUIRED'
    | 'PERMISSIONED_SOURCE_REQUIRED';
  guidanceOnly: true;
  lastReviewedAt: string | null;
  evidenceCompleteness: 'COMPLETE' | 'PARTIAL' | 'MISSING';
};

const SOURCE_LABELS: Record<string, string> = {
  USER_SUBMITTED: 'User submitted supporting evidence',
  USER_PROVIDED_OFFICIAL_SOURCE_EVIDENCE: 'User provided official-source evidence',
  TKGM_MANUAL_EVIDENCE: 'TKGM manual evidence',
  TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE: 'TKGM public parcel sorgu evidence',
  TKGM_ANALYSIS_MARKET_SIGNAL: 'TKGM analysis/market signal evidence',
  MUNICIPALITY_IMAR_EVIDENCE: 'Municipality imar evidence',
  E_PLAN_EVIDENCE: 'Municipality e-plan evidence',
  UCBP_TUCBS_INFORMATIONAL_EVIDENCE: 'UCBP/TUCBS informational evidence',
  LISTING_SOURCE: 'Listing source evidence',
  ADMIN_MANUAL_OBSERVATION: 'Admin manual observation',
  UNKNOWN: 'Source not available yet',
};

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function mapReviewStatus(rawReviewStatus: unknown): EvidenceMetadataContract['reviewStatus'] {
  const reviewStatus = String(rawReviewStatus || '').trim().toUpperCase();
  if (!reviewStatus) return 'NOT_YET_REVIEWED';
  if (reviewStatus === 'CONFIRMED_BY_USER' || reviewStatus === 'CONFIRMED_BY_ADMIN') return 'REVIEWED_FOR_GUIDANCE';
  if (reviewStatus === 'MANUAL_REVIEW_REQUIRED') return 'MANUAL_REVIEW_REQUIRED';
  if (reviewStatus === 'REJECTED') return 'INSUFFICIENT_EVIDENCE';
  if (reviewStatus === 'PREVIEW_ONLY' || reviewStatus === 'NEEDS_REVIEW') return 'NOT_YET_REVIEWED';
  return 'NOT_YET_REVIEWED';
}

function inferSourceStatus(sourceType: string): EvidenceMetadataContract['sourceStatus'] {
  if (!sourceType || sourceType === 'UNKNOWN') return 'NOT_AVAILABLE_YET';
  if (sourceType === 'MUNICIPALITY_IMAR_EVIDENCE' || sourceType === 'E_PLAN_EVIDENCE') return 'MANUAL_CHECK_REQUIRED';
  if (sourceType === 'UCBP_TUCBS_INFORMATIONAL_EVIDENCE') return 'PERMISSION_REQUIRED';
  return 'AVAILABLE';
}

export function buildEvidenceMetadataContract(input: {
  sourceType?: unknown;
  reviewStatus?: unknown;
  metadataStatus?: unknown;
  evidenceType?: unknown;
  supportingEvidenceOnly?: unknown;
  uploadedAt?: unknown;
  createdAt?: unknown;
}): EvidenceMetadataContract {
  const sourceType = String(input.sourceType || '').trim() || 'UNKNOWN';
  const reviewStatus = mapReviewStatus(input.reviewStatus || input.metadataStatus);
  const sourceStatus = inferSourceStatus(sourceType);
  const supportingEvidenceOnly = Boolean(input.supportingEvidenceOnly);
  const evidenceType = String(input.evidenceType || '').trim();
  const hasEvidenceType = Boolean(evidenceType);

  const manualActionRequired =
    reviewStatus !== 'REVIEWED_FOR_GUIDANCE' || sourceStatus !== 'AVAILABLE' || supportingEvidenceOnly;

  const manualActionHint = manualActionRequired
    ? 'Manual evidence still needed. Upload supporting screenshot or document and review before guidance use.'
    : 'Guidance-ready evidence available. Keep manual official checks in workflow.';

  const officialVerificationStatus: EvidenceMetadataContract['officialVerificationStatus'] =
    sourceStatus === 'PERMISSION_REQUIRED'
      ? 'PERMISSIONED_SOURCE_REQUIRED'
      : sourceStatus === 'MANUAL_CHECK_REQUIRED' || manualActionRequired
      ? 'MANUAL_OFFICIAL_CHECK_REQUIRED'
      : 'NOT_OFFICIAL_VERIFICATION';

  const evidenceCompleteness: EvidenceMetadataContract['evidenceCompleteness'] =
    hasEvidenceType && reviewStatus === 'REVIEWED_FOR_GUIDANCE' && sourceStatus === 'AVAILABLE'
      ? 'COMPLETE'
      : hasEvidenceType
      ? 'PARTIAL'
      : 'MISSING';

  const confidenceLevel: EvidenceMetadataContract['confidenceLevel'] =
    reviewStatus === 'REVIEWED_FOR_GUIDANCE' ? 'MEDIUM' : 'LOW';

  const sourceLabel = SOURCE_LABELS[sourceType] || sourceType.replace(/_/g, ' ').toLowerCase();

  return {
    sourceLabel,
    sourceType,
    sourceStatus,
    reviewStatus,
    confidenceLevel,
    manualActionRequired,
    manualActionHint,
    officialVerificationStatus,
    guidanceOnly: true,
    lastReviewedAt: toIsoOrNull(input.createdAt || input.uploadedAt),
    evidenceCompleteness,
  };
}
