import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminToolbar,
} from '../components/admin';
import { useToast } from '../components/ui';
import { getAuthHeader } from '../lib/authStorage';
import {
  getMunicipalityBlockedSource,
  getMunicipalityPublicSourceStatus,
  getMunicipalitySource,
  MunicipalityPublicSourceStatus,
} from '../lib/municipalitySourceRegistry';
import {
  AssistedRegistryExtractionRecord,
  AssistedRegistrySourceType,
  REQUIRED_ASSISTED_DATA_LABELS,
  getAssistedExtractionStorageKey,
  getAssistedManualCheckStorageKey,
} from '../lib/assistedPublicRegistry';
import {
  BasicRiskScanResult,
  ListingIntakeExtraction,
  ListingIntakeFields,
  buildListingIntakeExtraction,
  emptyListingIntakeFields,
  getMissingRequiredFields,
  parseListingUrl,
  parsePastedListingText,
  runBasicRiskScan,
} from '../lib/listingIntakeBasicRisk';

type ReviewStatusValue =
  | 'PREVIEW_ONLY'
  | 'NEEDS_REVIEW'
  | 'CONFIRMED_BY_USER'
  | 'CONFIRMED_BY_ADMIN'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'REJECTED';

type QueueStatus = 'ready' | 'uploading' | 'uploaded' | 'error';

type UploadQueueItem = {
  id: string;
  file: File;
  evidenceType: string;
  sourceType: string;
  metadataStatus: 'NEEDS_REVIEW' | 'PREVIEW_ONLY';
  supportingEvidenceOnly: boolean;
  status: QueueStatus;
  error?: string;
};

type UploadIntent =
  | 'PARCEL_IDENTITY'
  | 'MUNICIPAL_ZONING'
  | 'TKGM_PARCEL'
  | 'TKGM_PRICE_HISTORY'
  | 'GENERAL_SUPPORTING_EVIDENCE';

type UploadIntentPreset = {
  label: string;
  sourceLabel: string;
  evidenceType: string;
  sourceType: string;
  guidanceSteps: string[];
  sourceActionLabel: string;
  sourceUrl?: string;
  sourceUnavailableNote?: string;
  placeholder?: string;
  note?: string;
  registryStatus?: MunicipalityPublicSourceStatus;
  blockedRegistryStatus?: MunicipalityPublicSourceStatus;
  blockedSourceNote?: string;
};

type PublicRegistrySourceCard = {
  key: AssistedRegistrySourceType;
  title: string;
  description: string;
  sourceUrl?: string;
  publicStatus: MunicipalityPublicSourceStatus | 'VERIFIED_PUBLIC_REFERENCE';
  blockedStatus?: MunicipalityPublicSourceStatus;
  blockedNote?: string;
  uploadIntent: UploadIntent;
};

const EMPTY_EXTRACTION_FIELDS: AssistedRegistryExtractionRecord['fields'] = {
  il: '',
  ilce: '',
  mahalle: '',
  ada: '',
  parsel: '',
  yuzolcumu: '',
  nitelik: '',
  imarDurumu: '',
  taks: '',
  kaks: '',
  katAdedi: '',
};

const evidenceTypeOptions = [
  'LISTING_SCREENSHOT',
  'TKGM_PARCEL_SCREENSHOT',
  'TKGM_ANALYSIS_SCREENSHOT',
  'TKGM_PRICE_HISTORY_SCREENSHOT',
  'TKGM_EXPORT_PDF',
  'TKGM_EXPORT_KML',
  'TKGM_EXPORT_GEOJSON',
  'TKGM_SCREENSHOT',
  'TKGM_EXPORT',
  'MUNICIPALITY_IMAR_DOCUMENT',
  'E_PLAN_DOCUMENT',
  'UCBP_TUCBS_EXPORT',
  'UCBP_TUCBS_SCREENSHOT',
  'MAP_LOCATION_CSV',
  'PHOTO',
  'OTHER',
];

const sourceTypeOptions = [
  'USER_SUBMITTED',
  'USER_PROVIDED_OFFICIAL_SOURCE_EVIDENCE',
  'TKGM_MANUAL_EVIDENCE',
  'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
  'TKGM_ANALYSIS_MARKET_SIGNAL',
  'MUNICIPALITY_IMAR_EVIDENCE',
  'E_PLAN_EVIDENCE',
  'UCBP_TUCBS_INFORMATIONAL_EVIDENCE',
  'LISTING_SOURCE',
  'ADMIN_MANUAL_OBSERVATION',
  'UNKNOWN',
];

const metadataStatusOptions: Array<'NEEDS_REVIEW' | 'PREVIEW_ONLY'> = ['NEEDS_REVIEW', 'PREVIEW_ONLY'];

function resolveUploadIntentPreset(intent: string | null, province?: string, district?: string): UploadIntentPreset | null {
  const normalized = String(intent || '').toUpperCase() as UploadIntent;
  if (!normalized) return null;

  if (normalized === 'PARCEL_IDENTITY') {
    return {
      label: 'Upload parcel identity evidence',
      sourceLabel: 'TKGM Parsel Sorgu',
      evidenceType: 'TKGM_PARCEL_SCREENSHOT',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Search by il/ilce/mahalle/ada/parsel if available.',
        'Capture screenshot/export PDF/KML/GeoJSON if available.',
      ],
    };
  }

  if (normalized === 'TKGM_PARCEL') {
    return {
      label: 'Upload TKGM parcel evidence',
      sourceLabel: 'TKGM Parsel Sorgu',
      evidenceType: 'TKGM_PARCEL_SCREENSHOT',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Review parcel details and capture screenshot/export evidence.',
      ],
    };
  }

  if (normalized === 'MUNICIPAL_ZONING') {
    const registry = getMunicipalitySource(province, district);
    const blockedSource = getMunicipalityBlockedSource(province, district);
    const publicStatus = getMunicipalityPublicSourceStatus(registry.source);
    const hasVerifiedSource = registry.status === 'VERIFIED_OFFICIAL_SOURCE' && Boolean(registry.source?.url);
    const preferredMunicipalEvidenceType = evidenceTypeOptions.includes('MUNICIPALITY_IMAR_SCREENSHOT')
      ? 'MUNICIPALITY_IMAR_SCREENSHOT'
      : 'OTHER';
    return {
      label: 'Upload municipal/e-plan evidence',
      sourceLabel: hasVerifiedSource
        ? `Official public source to check manually: ${registry.source?.sourceLabel || 'Municipality e-Imar / e-Plan / Imar Durumu'}`
        : 'Official public source to check manually: Municipality e-Imar / e-Plan / Imar Durumu',
      evidenceType: preferredMunicipalEvidenceType,
      sourceType: 'USER_SUBMITTED',
      sourceActionLabel: hasVerifiedSource ? 'Open official public source' : 'Open municipality guidance',
      sourceUrl: hasVerifiedSource ? registry.source?.url : undefined,
      guidanceSteps: [
        'Official public source to check manually.',
        'Use the official website of the relevant municipality/district and search for e-Imar, e-Plan, or Imar Durumu.',
        'If no online service exists, request an imar durum belgesi from municipality.',
        'This is guidance only, not automated zoning verification.',
        'Upload a screenshot/document as supporting evidence after checking the source.',
      ],
      sourceUnavailableNote: hasVerifiedSource ? undefined : 'Exact municipality source URL is not configured yet.',
      placeholder: 'Future upgrade: municipality source registry can map il/ilce to official e-Imar/e-Plan URLs after manual verification.',
      note: 'This is guidance only, not automated zoning verification.',
      registryStatus: publicStatus,
      blockedRegistryStatus: blockedSource?.status,
      blockedSourceNote: blockedSource
        ? `${blockedSource.sourceLabel}: ${blockedSource.reason}`
        : undefined,
    };
  }

  if (normalized === 'TKGM_PRICE_HISTORY') {
    return {
      label: 'Upload TKGM price-history screenshot',
      sourceLabel: 'TKGM Parsel Sorgu Analiz / Alim-Satim Istatistikleri',
      evidenceType: 'TKGM_PRICE_HISTORY_SCREENSHOT',
      sourceType: 'TKGM_ANALYSIS_MARKET_SIGNAL',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Use analysis/price-history/statistics tab if available.',
        'Capture screenshot as market signal evidence.',
      ],
      note: 'Market signal only, not official valuation proof.',
    };
  }

  if (normalized === 'GENERAL_SUPPORTING_EVIDENCE') {
    return {
      label: 'Upload supporting evidence',
      sourceLabel: 'Manual supporting evidence',
      evidenceType: 'OTHER',
      sourceType: 'USER_SUBMITTED',
      sourceActionLabel: 'Open guidance',
      guidanceSteps: [
        'Upload relevant screenshots, PDFs, official letters, listing screenshots, or supporting documents.',
      ],
    };
  }

  return null;
}

function getFileExtension(filename: string) {
  const normalized = String(filename || '');
  const index = normalized.lastIndexOf('.');
  if (index < 0 || index === normalized.length - 1) return 'unknown';
  return normalized.slice(index + 1).toLowerCase();
}

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function hasAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function suggestEvidenceMetadata(filename: string, mimeType?: string) {
  const normalizedName = stripDiacritics(String(filename || '').toLowerCase());
  const extension = getFileExtension(filename);
  const normalizedMime = String(mimeType || '').toLowerCase();
  const metadataStatus: 'NEEDS_REVIEW' | 'PREVIEW_ONLY' =
    extension === 'csv' || normalizedMime.includes('csv') ? 'PREVIEW_ONLY' : 'NEEDS_REVIEW';

  if (extension === 'kml') {
    return {
      evidenceType: 'TKGM_EXPORT_KML',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      metadataStatus,
    };
  }

  if (extension === 'geojson' || extension === 'json') {
    return {
      evidenceType: 'TKGM_EXPORT_GEOJSON',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      metadataStatus,
    };
  }

  if (extension === 'pdf' && normalizedName.includes('tkgm')) {
    return {
      evidenceType: 'TKGM_EXPORT_PDF',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      metadataStatus,
    };
  }

  if (hasAnyKeyword(normalizedName, ['analiz', 'alimsatim', 'alim', 'satim', 'fiyat', 'price', 'history'])) {
    return {
      evidenceType: 'TKGM_PRICE_HISTORY_SCREENSHOT',
      sourceType: 'TKGM_ANALYSIS_MARKET_SIGNAL',
      metadataStatus,
    };
  }

  if (hasAnyKeyword(normalizedName, ['tkgm', 'parsel', 'kadastro', 'ada'])) {
    return {
      evidenceType: 'TKGM_PARCEL_SCREENSHOT',
      sourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
      metadataStatus,
    };
  }

  return {
    evidenceType: 'OTHER',
    sourceType: 'USER_SUBMITTED',
    metadataStatus,
  };
}

function statusText(status?: string) {
  const normalized = String(status || '').toUpperCase() as ReviewStatusValue;
  if (normalized === 'PREVIEW_ONLY') return 'Preview only';
  if (normalized === 'NEEDS_REVIEW') return 'Needs review';
  if (normalized === 'CONFIRMED_BY_USER') return 'Confirmed by user';
  if (normalized === 'CONFIRMED_BY_ADMIN') return 'Confirmed by admin';
  if (normalized === 'MANUAL_REVIEW_REQUIRED') return 'Manual review required';
  if (normalized === 'REJECTED') return 'Rejected';
  if (normalized === 'NOT_YET_REVIEWED') return 'Not yet reviewed';
  if (normalized === 'REVIEWED_FOR_GUIDANCE') return 'Reviewed for guidance';
  if (normalized === 'INSUFFICIENT_EVIDENCE') return 'Insufficient evidence';
  return 'Not yet reviewed';
}

function statusClass(status?: string) {
  const normalized = String(status || '').toUpperCase() as ReviewStatusValue;
  if (normalized === 'CONFIRMED_BY_ADMIN' || normalized === 'CONFIRMED_BY_USER') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (normalized === 'REJECTED' || normalized === 'MANUAL_REVIEW_REQUIRED') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

export default function PropertyDocuments() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState<
    Array<{
      _id: string;
      documentType: string;
      evidenceType?: string;
      sourceType?: string;
      reviewStatus?: string;
      metadataStatus?: string;
      supportingEvidenceOnly?: boolean;
      evidenceMetadata?: {
        sourceLabel?: string;
        reviewStatus?: string;
        manualActionRequired?: boolean;
        manualActionHint?: string;
        officialVerificationStatus?: string;
        evidenceCompleteness?: string;
      };
      csvDetectedFields?: string[];
      originalName: string;
      uploadedAt?: string;
      createdAt?: string;
      mimeType?: string;
      fileUrl?: string;
      downloadUrl?: string;
      fileMissing?: boolean;
      sizeBytes?: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [showReturnToResult, setShowReturnToResult] = useState(false);
  const [propertyLocation, setPropertyLocation] = useState<{ province?: string; district?: string }>({});
  const [manualChecks, setManualChecks] = useState<Record<AssistedRegistrySourceType, boolean>>({
    TKGM: false,
    KAYSERI_EIMAR: false,
    KOCASINAN_EIMAR: false,
    MELIKGAZI_EIMAR: false,
  });
  const [extractions, setExtractions] = useState<AssistedRegistryExtractionRecord[]>([]);
  const [extractionDraft, setExtractionDraft] = useState<AssistedRegistryExtractionRecord>({
    sourceType: 'TKGM',
    extractionMode: 'MANUAL_ENTRY',
    fields: { ...EMPTY_EXTRACTION_FIELDS },
    confidence: 'LOW',
    officialVerification: false,
    checkedManually: false,
    updatedAt: new Date().toISOString(),
  });
  const [listingIntakeFields, setListingIntakeFields] = useState<ListingIntakeFields>(emptyListingIntakeFields());
  const [listingExtraction, setListingExtraction] = useState<ListingIntakeExtraction | null>(null);
  const [ownershipType, setOwnershipType] = useState('');
  const [basicRiskScanResult, setBasicRiskScanResult] = useState<BasicRiskScanResult | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const intentPreset = useMemo(
    () => resolveUploadIntentPreset(searchParams.get('intent'), propertyLocation.province, propertyLocation.district),
    [searchParams, propertyLocation]
  );
  const municipalityGuidancePreset = useMemo(
    () => resolveUploadIntentPreset('MUNICIPAL_ZONING', propertyLocation.province, propertyLocation.district),
    [propertyLocation]
  );
  const returnToResult = String(searchParams.get('returnTo') || '').toLowerCase() === 'result';

  const storageKey = id ? getAssistedExtractionStorageKey(id) : '';
  const manualCheckStorageKey = id ? getAssistedManualCheckStorageKey(id) : '';
  const listingIntakeStorageKey = id ? `parselradar:mvp4b-listing-intake:${id}` : '';
  const listingRiskScanStorageKey = id ? `parselradar:mvp4b-risk-scan:${id}` : '';

  const hasScreenshotOrDocument = documents.length > 0;
  const missingRequiredFields = useMemo(
    () => getMissingRequiredFields(listingIntakeFields, hasScreenshotOrDocument),
    [listingIntakeFields, hasScreenshotOrDocument]
  );
  const readyForBasicRiskScan = missingRequiredFields.length === 0;

  const hasImarEvidence = useMemo(
    () =>
      documents.some((doc) =>
        ['MUNICIPALITY_IMAR_DOCUMENT', 'E_PLAN_DOCUMENT'].includes(String(doc.evidenceType || '').trim()) ||
        ['MUNICIPALITY_IMAR_EVIDENCE', 'E_PLAN_EVIDENCE'].includes(String(doc.sourceType || '').trim())
      ),
    [documents]
  );

  const hasPublicRegistryEvidence = useMemo(
    () =>
      documents.some((doc) => {
        const sourceType = String(doc.sourceType || '').trim();
        const evidenceType = String(doc.evidenceType || '').trim();
        return (
          sourceType.startsWith('TKGM_') ||
          sourceType.includes('MUNICIPALITY') ||
          sourceType.includes('E_PLAN') ||
          evidenceType.startsWith('TKGM_') ||
          evidenceType === 'MUNICIPALITY_IMAR_DOCUMENT' ||
          evidenceType === 'E_PLAN_DOCUMENT'
        );
      }),
    [documents]
  );

  const hasRoadEvidence = useMemo(
    () =>
      documents.some((doc) => {
        const name = String(doc.originalName || '').toLocaleLowerCase('tr-TR');
        return name.includes('yol') || name.includes('cephe') || name.includes('ulasim') || name.includes('ulaşım');
      }),
    [documents]
  );

  useEffect(() => {
    if (!listingIntakeStorageKey || !listingRiskScanStorageKey) return;

    try {
      const rawFields = window.localStorage.getItem(listingIntakeStorageKey);
      if (rawFields) {
        const parsed = JSON.parse(rawFields) as ListingIntakeFields;
        if (parsed && typeof parsed === 'object') {
          setListingIntakeFields((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore malformed local storage.
    }

    try {
      const rawScan = window.localStorage.getItem(listingRiskScanStorageKey);
      if (rawScan) {
        const parsed = JSON.parse(rawScan) as BasicRiskScanResult;
        if (parsed && typeof parsed === 'object') {
          setBasicRiskScanResult(parsed);
        }
      }
    } catch {
      // Ignore malformed local storage.
    }
  }, [listingIntakeStorageKey, listingRiskScanStorageKey]);

  useEffect(() => {
    setListingIntakeFields((prev) => {
      if (prev.il && prev.ilce) return prev;
      return {
        ...prev,
        il: prev.il || propertyLocation.province || '',
        ilce: prev.ilce || propertyLocation.district || '',
      };
    });
  }, [propertyLocation]);

  const persistListingIntake = (next: ListingIntakeFields) => {
    setListingIntakeFields(next);
    if (!listingIntakeStorageKey) return;
    try {
      window.localStorage.setItem(listingIntakeStorageKey, JSON.stringify(next));
    } catch {
      toast.error('Listing intake fields could not be saved');
    }
  };

  const updateListingField = <K extends keyof ListingIntakeFields>(field: K, value: ListingIntakeFields[K]) => {
    const next = { ...listingIntakeFields, [field]: value };
    persistListingIntake(next);
  };

  const applyExtractionFromInputs = () => {
    const parsedUrl = parseListingUrl(listingIntakeFields.listingUrl);
    const parsedText = parsePastedListingText(listingIntakeFields.pastedText);
    const nextFields: ListingIntakeFields = {
      ...listingIntakeFields,
      ...parsedText,
      listingUrl: parsedUrl.listingUrl || listingIntakeFields.listingUrl,
      sourceDomain: parsedUrl.sourceDomain || listingIntakeFields.sourceDomain,
      claims: parsedText.claims || listingIntakeFields.claims,
      locationConfidence:
        listingIntakeFields.locationConfidence ||
        (parsedText.mahalle || parsedText.ada || parsedText.parsel ? 'MEDIUM' : listingIntakeFields.locationConfidence),
    };

    persistListingIntake(nextFields);

    const extraction = buildListingIntakeExtraction(
      nextFields,
      nextFields.listingUrl ? 'URL' : nextFields.pastedText ? 'PASTED_TEXT' : 'SCREENSHOT',
      nextFields.pastedText ? 'PASTED_TEXT_PARSE' : 'MANUAL_ENTRY',
      hasScreenshotOrDocument
    );
    setListingExtraction(extraction);
  };

  const runBasicRiskScanHandler = () => {
    if (!readyForBasicRiskScan) return;

    const result = runBasicRiskScan({
      fields: listingIntakeFields,
      hasScreenshotOrDocument,
      hasImarEvidence,
      hasRoadEvidence,
      hasPublicRegistryEvidence,
      ownershipType,
    });
    setBasicRiskScanResult(result);

    if (listingRiskScanStorageKey) {
      try {
        window.localStorage.setItem(listingRiskScanStorageKey, JSON.stringify(result));
      } catch {
        toast.error('Basic risk scan result could not be saved');
      }
    }
  };

  const publicRegistryCards = useMemo<PublicRegistrySourceCard[]>(() => {
    const kayseri = getMunicipalitySource('KAYSERI', 'KAYSERI');
    const kocasinan = getMunicipalitySource('KAYSERI', 'KOCASINAN');
    const melikgazi = getMunicipalitySource('KAYSERI', 'MELIKGAZI');
    const melikgaziBlocked = getMunicipalityBlockedSource('KAYSERI', 'MELIKGAZI');

    return [
      {
        key: 'TKGM',
        title: 'TKGM Parsel Sorgu',
        description: 'Manual source guidance only. Open publicly available reference and upload user-provided evidence.',
        sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
        publicStatus: 'VERIFIED_PUBLIC_REFERENCE',
        uploadIntent: 'TKGM_PARCEL',
      },
      {
        key: 'KAYSERI_EIMAR',
        title: 'Kayseri CBS / e-imar reference',
        description: 'Informational municipality reference. No automated fetch, no official verification claim.',
        sourceUrl: kayseri.source?.url,
        publicStatus: getMunicipalityPublicSourceStatus(kayseri.source),
        uploadIntent: 'MUNICIPAL_ZONING',
      },
      {
        key: 'KOCASINAN_EIMAR',
        title: 'Kocasinan e-imar reference',
        description: 'Use manually checked municipality source and upload screenshot/document as user-provided evidence.',
        sourceUrl: kocasinan.source?.url,
        publicStatus: getMunicipalityPublicSourceStatus(kocasinan.source),
        uploadIntent: 'MUNICIPAL_ZONING',
      },
      {
        key: 'MELIKGAZI_EIMAR',
        title: 'Melikgazi e-imar reference',
        description: 'Guidance-only reference. If login/CAPTCHA required, keep manual process and do not automate.',
        sourceUrl: melikgazi.source?.url,
        publicStatus: getMunicipalityPublicSourceStatus(melikgazi.source),
        blockedStatus: melikgaziBlocked?.status,
        blockedNote: melikgaziBlocked?.reason,
        uploadIntent: 'MUNICIPAL_ZONING',
      },
    ];
  }, []);

  useEffect(() => {
    if (!storageKey || !manualCheckStorageKey) return;

    try {
      const rawChecks = window.localStorage.getItem(manualCheckStorageKey);
      if (rawChecks) {
        const parsed = JSON.parse(rawChecks) as Record<AssistedRegistrySourceType, boolean>;
        setManualChecks((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore malformed local storage.
    }

    try {
      const rawExtractions = window.localStorage.getItem(storageKey);
      if (rawExtractions) {
        const parsed = JSON.parse(rawExtractions) as AssistedRegistryExtractionRecord[];
        if (Array.isArray(parsed)) {
          setExtractions(parsed);
        }
      }
    } catch {
      // Ignore malformed local storage.
    }
  }, [storageKey, manualCheckStorageKey]);

  const persistManualChecks = (nextChecks: Record<AssistedRegistrySourceType, boolean>) => {
    setManualChecks(nextChecks);
    if (!manualCheckStorageKey) return;
    try {
      window.localStorage.setItem(manualCheckStorageKey, JSON.stringify(nextChecks));
    } catch {
      toast.error('Manual check status could not be saved');
    }
  };

  const saveExtractionDraft = () => {
    if (!storageKey) return;

    const nextRecord: AssistedRegistryExtractionRecord = {
      ...extractionDraft,
      checkedManually: manualChecks[extractionDraft.sourceType] || false,
      updatedAt: new Date().toISOString(),
      officialVerification: false,
    };

    const next = [
      nextRecord,
      ...extractions.filter((item) => item.sourceType !== nextRecord.sourceType),
    ];
    setExtractions(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      toast.success('Extraction schema saved as user-provided evidence metadata');
    } catch {
      toast.error('Extraction schema could not be saved');
    }
  };

  const jumpToUploadWithIntent = (intent: UploadIntent) => {
    if (!id) return;
    const params = new URLSearchParams(searchParams);
    params.set('intent', intent);
    navigate(`/properties/${id}/documents?${params.toString()}#upload`);
  };

  function absoluteFileUrl(fileUrl?: string) {
    if (!fileUrl) return '';
    const base = getApiBaseUrl();
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return `${base.replace(/\/+$/, '')}/${fileUrl.replace(/^\/+/, '')}`;
  }

  function formatBytes(bytes?: number) {
    if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  const loadDocuments = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = (await apiFetch(`properties/${id}`)) as {
        documents?: Array<{
          _id: string;
          documentType: string;
          originalName: string;
          uploadedAt?: string;
          createdAt?: string;
          mimeType?: string;
          fileUrl?: string;
          downloadUrl?: string;
          fileMissing?: boolean;
          sizeBytes?: number;
        }>;
        il?: string;
        ilce?: string;
      };
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      setPropertyLocation({ province: data.il, district: data.ilce });
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.error(e.error || e.message || 'Belge listesi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cards = useMemo(() => {
    return documents.map((doc) => {
      const fileHref = absoluteFileUrl(doc.fileUrl);
      const downloadHref = absoluteFileUrl(doc.downloadUrl || doc.fileUrl);
      const isImage = (doc.mimeType || '').startsWith('image/');
      const isPdf = doc.mimeType === 'application/pdf';
      const hasFile = Boolean(fileHref) && !doc.fileMissing;
      return { ...doc, fileHref, downloadHref, isImage, isPdf, hasFile };
    });
  }, [documents]);

  useEffect(() => {
    let disposed = false;
    const nextUrls: Record<string, string> = {};
    const currentObjectUrls: string[] = [];

    const loadPreviews = async () => {
      const authHeader = getAuthHeader();
      const failed: Record<string, string> = {};

      await Promise.all(
        cards.map(async (doc) => {
          if (!doc.isImage || !doc.hasFile || !doc.fileHref) return;
          try {
            const response = await fetch(doc.fileHref, {
              method: 'GET',
              credentials: 'include',
              headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
              },
            });
            if (!response.ok) {
              throw new Error(`Preview request failed (${response.status})`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            nextUrls[doc._id] = objectUrl;
            currentObjectUrls.push(objectUrl);
          } catch {
            failed[doc._id] = 'Authenticated preview unavailable';
          }
        })
      );

      if (disposed) {
        currentObjectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setPreviewUrls(nextUrls);
      setPreviewErrors(failed);
    };

    loadPreviews();

    return () => {
      disposed = true;
      currentObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [cards]);

  const updateQueueItem = (itemId: string, update: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...update } : item)));
  };

  const removeQueueItem = (itemId: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || uploadQueue.length === 0) return;

    const pendingItems = uploadQueue.filter((item) => item.status === 'ready' || item.status === 'error');
    if (pendingItems.length === 0) {
      toast.error('No pending files to upload');
      return;
    }

    setUploading(true);
    const loadingToastId = toast.loading('Belge yükleniyor...');
    const authHeader = getAuthHeader();
    let uploadedCount = 0;
    let failedCount = 0;
    try {
      for (const item of pendingItems) {
        updateQueueItem(item.id, { status: 'uploading', error: undefined });

        const extension = getFileExtension(item.file.name);
        const mime = String(item.file.type || '').toLowerCase();
        if (extension === 'csv' || mime.includes('csv')) {
          failedCount += 1;
          updateQueueItem(item.id, {
            status: 'error',
            error: 'CSV preview is available, but CSV upload is not enabled yet.',
          });
          continue;
        }

        const formData = new FormData();
        formData.append('documentType', item.evidenceType);
        formData.append('evidenceType', item.evidenceType);
        formData.append('sourceType', item.sourceType);
        formData.append('reviewStatus', 'NEEDS_REVIEW');
        formData.append('metadataStatus', item.metadataStatus);
        formData.append('supportingEvidenceOnly', String(item.supportingEvidenceOnly));
        formData.append('file', item.file);

        try {
          const response = await fetch(`${getApiBaseUrl()}/properties/${id}/documents`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              ...(authHeader ? { Authorization: authHeader } : {}),
            },
          });

          const text = await response.text();
          const data = text ? JSON.parse(text) : null;
          if (!response.ok) {
            const reqId = data?.requestId ? ` (requestId: ${data.requestId})` : '';
            throw new Error((data?.error || 'Yükleme başarısız') + reqId);
          }

          uploadedCount += 1;
          updateQueueItem(item.id, { status: 'uploaded', error: undefined });
        } catch (err: any) {
          failedCount += 1;
          updateQueueItem(item.id, { status: 'error', error: err?.message || 'Yükleme başarısız' });
        }
      }

      toast.dismiss(loadingToastId);
      if (uploadedCount > 0 && failedCount === 0) {
        toast.success(`${uploadedCount} belge yüklendi`);
      } else if (uploadedCount > 0 && failedCount > 0) {
        toast.success(`${uploadedCount} yüklendi, ${failedCount} hata`);
      } else {
        toast.error('Yükleme başarısız');
      }
      if (uploadedCount > 0 && returnToResult) {
        setShowReturnToResult(true);
      }
      await loadDocuments();
    } catch (err) {
      const e = err as { message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incomingItems: UploadQueueItem[] = Array.from(fileList).map((nextFile, index) => {
      const baseSuggestion = suggestEvidenceMetadata(nextFile.name, nextFile.type);
      const suggestion = intentPreset
        ? {
            ...baseSuggestion,
            evidenceType: intentPreset.evidenceType,
            sourceType: intentPreset.sourceType,
          }
        : baseSuggestion;
      return {
        id: `${Date.now()}-${index}-${nextFile.name}`,
        file: nextFile,
        evidenceType: suggestion.evidenceType,
        sourceType: suggestion.sourceType,
        metadataStatus: suggestion.metadataStatus,
        supportingEvidenceOnly: true,
        status: 'ready',
      };
    });

    setUploadQueue((prev) => {
      const existingKeys = new Set(prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`));
      const uniqueIncoming = incomingItems.filter(
        (item) => !existingKeys.has(`${item.file.name}-${item.file.size}-${item.file.lastModified}`)
      );
      return [...prev, ...uniqueIncoming];
    });
  };

  const handleDelete = async (documentId: string) => {
    if (!id) return;
    setDeletingId(documentId);
    const loadingToastId = toast.loading('Belge siliniyor...');
    try {
      await apiFetch(`properties/${id}/documents/${documentId}`, { method: 'DELETE' });
      toast.dismiss(loadingToastId);
      toast.success('Belge silindi');
      await loadDocuments();
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Silme başarısız');
    } finally {
      setDeletingId('');
    }
  };

  const hasPendingQueueItems = uploadQueue.some((item) => item.status === 'ready' || item.status === 'error');

  return (
    <AdminPage className="premium-documents">
      <AdminSurface className="p-4 sm:p-5 space-y-5">
        <AdminHeader
          title="Belge Yönetimi"
          subtitle="Belgeleri yükleyin, önizleyin ve yönetin"
        />

        {loading ? <div className="text-sm text-slate-600">Loading documents...</div> : null}

        <section className="space-y-3">
          <AdminToolbar className="justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Existing Documents</h3>
          </AdminToolbar>

          {!loading && cards.length === 0 ? (
            <AdminEmptyState>Henüz belge yüklenmedi.</AdminEmptyState>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {cards.map((doc) => (
              <article key={doc._id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <AdminStatusPill tone="info">{doc.documentType}</AdminStatusPill>
                  <span className="text-xs text-slate-500">
                    {new Date(doc.createdAt || doc.uploadedAt || '').toLocaleString()}
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-900 break-words" title={doc.originalName}>
                  {doc.originalName}
                </div>
                <div className="mt-1 text-xs text-slate-500">Size: {formatBytes(doc.sizeBytes)}</div>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {doc.evidenceType ? <div>Evidence type: {doc.evidenceType}</div> : null}
                  {doc.sourceType ? <div>Source type: {doc.sourceType}</div> : null}
                  {doc.evidenceMetadata?.sourceLabel ? <div>Source label: {doc.evidenceMetadata.sourceLabel}</div> : null}
                  <div className="flex flex-wrap gap-1">
                    <span className={`inline-flex rounded border px-2 py-0.5 ${statusClass(doc.reviewStatus)}`}>
                      Review status: {statusText(doc.evidenceMetadata?.reviewStatus || doc.reviewStatus)}
                    </span>
                    <span className={`inline-flex rounded border px-2 py-0.5 ${statusClass(doc.metadataStatus)}`}>
                      Metadata status: {statusText(doc.metadataStatus)}
                    </span>
                  </div>
                  {doc.supportingEvidenceOnly ? <div>Supporting evidence only</div> : null}
                  {doc.evidenceMetadata?.evidenceCompleteness ? <div>Evidence completeness: {doc.evidenceMetadata.evidenceCompleteness}</div> : null}
                  {doc.evidenceMetadata?.officialVerificationStatus ? <div>Official verification status: {doc.evidenceMetadata.officialVerificationStatus}</div> : null}
                  {doc.evidenceMetadata?.manualActionRequired ? (
                    <div>{doc.evidenceMetadata.manualActionHint || 'Manual evidence still needed before verified analysis use.'}</div>
                  ) : null}
                  <div className="text-slate-500">Guidance only - not official property verification.</div>
                  {Array.isArray(doc.csvDetectedFields) && doc.csvDetectedFields.length > 0 ? (
                    <div>CSV fields: {doc.csvDetectedFields.join(', ')}</div>
                  ) : null}
                </div>

                <div className="mt-3">
                  {doc.isImage && doc.hasFile && previewUrls[doc._id] ? (
                    <img
                      src={previewUrls[doc._id]}
                      alt={doc.originalName}
                      className="w-full h-40 object-cover rounded-lg border border-slate-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500 text-center px-3">
                      {!doc.hasFile
                        ? 'Legacy file missing — re-upload required'
                        : doc.isImage
                        ? previewErrors[doc._id] || 'Loading preview...'
                        : doc.isPdf
                        ? 'PDF document'
                        : 'File preview not available'}
                    </div>
                  )}
                </div>

                <AdminToolbar className="mt-3">
                  <AdminButton
                    variant="primary"
                    disabled={!doc.hasFile}
                    onClick={() => {
                      if (doc.hasFile) window.open(doc.fileHref, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Open
                  </AdminButton>

                  <a
                    href={doc.downloadHref || '#'}
                    download={doc.originalName}
                    className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors flex items-center ${
                      !doc.hasFile
                        ? 'pointer-events-none opacity-50 bg-white text-slate-400 border-slate-200'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={(e) => {
                      if (!doc.hasFile) e.preventDefault();
                    }}
                  >
                    Download
                  </a>

                  <AdminButton
                    variant="danger"
                    disabled={deletingId === doc._id}
                    onClick={() => handleDelete(doc._id)}
                  >
                    {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                  </AdminButton>
                </AdminToolbar>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
          <AdminToolbar className="justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Listing Intake + Basic Risk Scan</h3>
          </AdminToolbar>

          <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">Intake sources</div>
            <div className="mt-1">Paste listing URL and/or listing text, and use screenshot/document upload if available.</div>
            <div className="mt-1">Screenshot/document path: {hasScreenshotOrDocument ? 'available from uploaded evidence' : 'not uploaded yet'}</div>
            <button
              type="button"
              className="mt-2 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                const uploadAnchor = document.getElementById('upload');
                uploadAnchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Upload screenshot/document
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="text-xs text-slate-700">
              Listing URL <span className="text-rose-600">*</span>
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.listingUrl}
                onChange={(e) => updateListingField('listingUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="text-xs text-slate-700">
              Source domain
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.sourceDomain}
                onChange={(e) => updateListingField('sourceDomain', e.target.value)}
                placeholder="domain"
              />
            </label>
            <label className="text-xs text-slate-700 md:col-span-2">
              Pasted listing text <span className="text-rose-600">*</span>
              <textarea
                className="mt-1 block min-h-24 w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.pastedText}
                onChange={(e) => updateListingField('pastedText', e.target.value)}
                placeholder="Paste listing text here"
              />
            </label>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              onClick={applyExtractionFromInputs}
            >
              Parse and pre-fill
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <label className="text-xs text-slate-700">
              Title
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.title}
                onChange={(e) => updateListingField('title', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              Price <span className="text-rose-600">*</span>
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.price ?? ''}
                onChange={(e) => updateListingField('price', Number(String(e.target.value).replace(',', '.')) || null)}
                type="number"
                min="0"
              />
            </label>
            <label className="text-xs text-slate-700">
              m² <span className="text-rose-600">*</span>
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.areaM2 ?? ''}
                onChange={(e) => updateListingField('areaM2', Number(String(e.target.value).replace(',', '.')) || null)}
                type="number"
                min="0"
              />
            </label>
            <label className="text-xs text-slate-700">
              İl <span className="text-rose-600">*</span>
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.il}
                onChange={(e) => updateListingField('il', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              İlçe <span className="text-rose-600">*</span>
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.ilce}
                onChange={(e) => updateListingField('ilce', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              Mahalle/Köy
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.mahalle}
                onChange={(e) => updateListingField('mahalle', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              Category <span className="text-rose-600">*</span>
              <select
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.category}
                onChange={(e) => updateListingField('category', e.target.value)}
              >
                <option value="">Select</option>
                <option value="arsa">arsa</option>
                <option value="tarla">tarla</option>
                <option value="bahçe">bahçe</option>
                <option value="daire">daire</option>
                <option value="other">other</option>
              </select>
            </label>
            <label className="text-xs text-slate-700">
              Ada
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.ada}
                onChange={(e) => updateListingField('ada', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              Parsel
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.parsel}
                onChange={(e) => updateListingField('parsel', e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-700">
              Location confidence <span className="text-rose-600">*</span>
              <select
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.locationConfidence}
                onChange={(e) => updateListingField('locationConfidence', e.target.value as ListingIntakeFields['locationConfidence'])}
              >
                <option value="">Select</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>
            <label className="text-xs text-slate-700 md:col-span-2">
              Claims (comma-separated)
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={listingIntakeFields.claims.join(', ')}
                onChange={(e) =>
                  updateListingField(
                    'claims',
                    e.target.value
                      .split(',')
                      .map((entry) => entry.trim())
                      .filter(Boolean)
                  )
                }
              />
            </label>
            <label className="text-xs text-slate-700">
              Ownership type
              <input
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value)}
                placeholder="hisseli / müstakil"
              />
            </label>
          </div>

          {listingExtraction ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Extraction readiness</div>
              <div className="mt-1">Input type: {listingExtraction.inputType}</div>
              <div>Extraction mode: {listingExtraction.extractionMode}</div>
              <div>Ready for basic risk scan: {listingExtraction.readyForBasicRiskScan ? 'yes' : 'no'}</div>
            </div>
          ) : null}

          {!readyForBasicRiskScan ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <div className="font-semibold text-rose-900">Vul ontbrekende data</div>
              <div className="mt-1">Basic Risk Scan is disabled until minimum required fields are complete.</div>
              <div className="mt-1">Missing required fields: {missingRequiredFields.join(', ')}</div>
            </div>
          ) : null}

          <div className="mt-3">
            <button
              type="button"
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={runBasicRiskScanHandler}
              disabled={!readyForBasicRiskScan}
            >
              Run Basic Risk Scan
            </button>
          </div>

          {basicRiskScanResult ? (
            <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Basic Risk Scan Result</div>
              <div>price/m²: {typeof basicRiskScanResult.pricePerM2 === 'number' ? basicRiskScanResult.pricePerM2.toLocaleString('tr-TR') : '-'}</div>
              <div>location confidence: {basicRiskScanResult.locationConfidence || '-'}</div>
              <div>next best action: {basicRiskScanResult.nextBestAction}</div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Risk signals</div>
                <ul className="mt-1 list-disc pl-4">
                  {basicRiskScanResult.missingEvidenceSignals.map((signal) => (
                    <li key={signal.key}>
                      {signal.key}: {signal.triggered ? 'triggered' : 'not triggered'} ({signal.level}) - confidence {signal.confidence || 'UNKNOWN'}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Risk keyword signals</div>
                <div className="mt-1">{basicRiskScanResult.riskKeywordSignals.length > 0 ? basicRiskScanResult.riskKeywordSignals.join(', ') : '-'}</div>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Seller questions</div>
                <ul className="mt-1 list-disc pl-4">
                  {basicRiskScanResult.sellerQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Decision snapshot</div>
                <div>overallReadiness: {basicRiskScanResult.decisionSnapshot.overallReadiness}</div>
                <div>mainOpportunity: {basicRiskScanResult.decisionSnapshot.mainOpportunity}</div>
                <div>mainRisk: {basicRiskScanResult.decisionSnapshot.mainRisk}</div>
                <div>nextBestAction: {basicRiskScanResult.decisionSnapshot.nextBestAction}</div>
                <div>confidenceLevel: {basicRiskScanResult.decisionSnapshot.confidenceLevel}</div>
                <div>officialVerificationNeeded: {basicRiskScanResult.decisionSnapshot.officialVerificationNeeded}</div>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Location Context Signals</div>
                <div className="mt-1">status: {basicRiskScanResult.geodataContext.status}</div>

                {basicRiskScanResult.geodataContext.status === 'SIGNALS_AVAILABLE' ? (
                  <>
                    <ul className="mt-1 list-disc pl-4">
                      {basicRiskScanResult.geodataContext.signals.map((signal) => (
                        <li key={signal.type}>
                          {signal.type}: {signal.name} | distanceKm={signal.distanceKm} | label={signal.label} | officialVerification={String(signal.officialVerification)}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
                      {basicRiskScanResult.geodataContext.message}
                    </div>
                    <ul className="mt-2 list-disc pl-4">
                      <li>Road proximity may reduce uncertainty, but does not prove cadastral road access.</li>
                      <li>Settlement proximity provides context, but does not prove official koy ici status.</li>
                      <li>Industrial/OSB proximity is market context, not investment guarantee.</li>
                      <li>Water proximity is context, not view/buildability proof.</li>
                    </ul>
                  </>
                ) : (
                  <div className="mt-1">{basicRiskScanResult.geodataContext.message}</div>
                )}
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <div className="font-medium text-slate-900">Source labels</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {basicRiskScanResult.labels.map((label) => (
                    <span key={label} className="inline-flex rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px]">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-800">
                {basicRiskScanResult.disclaimer}
              </div>
            </div>
          ) : null}

          <AdminToolbar className="justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Public Registry Checks</h3>
          </AdminToolbar>

          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Use this source as informational reference only. ParselRadar does not automatically verify TKGM/e-imar and does not replace official legal, tapu, imar or municipality verification.
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {publicRegistryCards.map((card) => (
              <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">{card.title}</div>
                <div className="mt-1">{card.description}</div>
                <div className="mt-1">Public source status: {card.publicStatus}</div>
                {card.blockedStatus ? <div className="mt-1">Blocked source status: {card.blockedStatus}</div> : null}
                {card.blockedNote ? <div className="mt-1">Blocked source note: {card.blockedNote}</div> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {card.sourceUrl ? (
                    <a
                      className="inline-flex rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open source
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-400"
                      disabled
                    >
                      Open source
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => jumpToUploadWithIntent(card.uploadIntent)}
                  >
                    Upload screenshot/document
                  </button>
                  <button
                    type="button"
                    className="inline-flex rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      persistManualChecks({
                        ...manualChecks,
                        [card.key]: !manualChecks[card.key],
                      })
                    }
                  >
                    {manualChecks[card.key] ? 'Unmark checked manually' : 'Mark as checked manually'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">OCR / Manual Extraction Schema (user-provided evidence)</div>
            <div className="mt-1">Extraction mode is schema-ready. OCR runtime is not activated in this phase.</div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <label>
                Source type
                <select
                  className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                  value={extractionDraft.sourceType}
                  onChange={(e) =>
                    setExtractionDraft((prev) => ({
                      ...prev,
                      sourceType: e.target.value as AssistedRegistrySourceType,
                    }))
                  }
                >
                  <option value="TKGM">TKGM</option>
                  <option value="KAYSERI_EIMAR">KAYSERI_EIMAR</option>
                  <option value="KOCASINAN_EIMAR">KOCASINAN_EIMAR</option>
                  <option value="MELIKGAZI_EIMAR">MELIKGAZI_EIMAR</option>
                </select>
              </label>
              <label>
                Extraction mode
                <select
                  className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                  value={extractionDraft.extractionMode}
                  onChange={(e) =>
                    setExtractionDraft((prev) => ({
                      ...prev,
                      extractionMode: e.target.value as AssistedRegistryExtractionRecord['extractionMode'],
                    }))
                  }
                >
                  <option value="USER_UPLOAD_OCR">USER_UPLOAD_OCR</option>
                  <option value="MANUAL_ENTRY">MANUAL_ENTRY</option>
                </select>
              </label>
              <label>
                Confidence
                <select
                  className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                  value={extractionDraft.confidence}
                  onChange={(e) =>
                    setExtractionDraft((prev) => ({
                      ...prev,
                      confidence: e.target.value as AssistedRegistryExtractionRecord['confidence'],
                    }))
                  }
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </label>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              {Object.entries(extractionDraft.fields).map(([field, value]) => (
                <label key={field}>
                  {field}
                  <input
                    className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5"
                    value={value}
                    onChange={(e) =>
                      setExtractionDraft((prev) => ({
                        ...prev,
                        fields: {
                          ...prev.fields,
                          [field]: e.target.value,
                        },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                onClick={saveExtractionDraft}
              >
                Save extraction schema
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-600">Saved extraction records: {extractions.length}</div>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">Required data labels</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {REQUIRED_ASSISTED_DATA_LABELS.map((label) => (
                <span key={label} className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px]">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div id="upload" className="h-px" />

          <AdminToolbar className="justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Upload New Documents</h3>
          </AdminToolbar>

          {municipalityGuidancePreset ? (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <div className="font-semibold text-blue-900">Municipality source guidance</div>
              <div className="mt-1">{municipalityGuidancePreset.sourceLabel}</div>
              <div className="mt-1">Public source status: {municipalityGuidancePreset.registryStatus || 'NOT_CONFIGURED'}</div>
              <div className="mt-1">Official source must be checked manually.</div>
              <div className="mt-1">No automated zoning result is available.</div>
              <div className="mt-1">Upload supporting screenshot or document after checking the official source.</div>
              {municipalityGuidancePreset.blockedRegistryStatus ? (
                <div className="mt-1">Blocked source status: {municipalityGuidancePreset.blockedRegistryStatus}</div>
              ) : null}
              {municipalityGuidancePreset.blockedSourceNote ? (
                <div className="mt-1">Blocked source: login/CAPTCHA/e-Devlet required</div>
              ) : null}
              {municipalityGuidancePreset.sourceUrl ? (
                <a
                  className="mt-2 inline-flex rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-800 hover:bg-blue-100"
                  href={municipalityGuidancePreset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {municipalityGuidancePreset.sourceActionLabel}
                </a>
              ) : (
                <button
                  className="mt-2 rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-800 opacity-60"
                  type="button"
                  disabled
                >
                  {municipalityGuidancePreset.sourceActionLabel}
                </button>
              )}
            </div>
          ) : null}

          {intentPreset ? (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <div className="font-semibold text-blue-900">You are uploading for: {intentPreset.label}</div>
              <div className="mt-1">Recommended source: {intentPreset.sourceLabel}</div>
              <div className="mt-1">Public source status: {intentPreset.registryStatus || 'NOT_CONFIGURED'}</div>
              {intentPreset.blockedRegistryStatus ? (
                <div className="mt-1">Blocked source status: {intentPreset.blockedRegistryStatus}</div>
              ) : null}
              <div className="mt-1">Where to obtain it:</div>
              <ul className="mt-1 list-disc pl-4">
                {intentPreset.guidanceSteps.map((step) => (
                  <li key={`${intentPreset.label}-${step}`}>{step}</li>
                ))}
              </ul>
              {intentPreset.sourceUnavailableNote ? <div className="mt-1">{intentPreset.sourceUnavailableNote}</div> : null}
              {intentPreset.blockedSourceNote ? <div className="mt-1">{intentPreset.blockedSourceNote}</div> : null}
              {intentPreset.placeholder ? <div className="mt-1">{intentPreset.placeholder}</div> : null}
              <div className="mt-1">Suggested evidence type: {intentPreset.evidenceType}</div>
              <div>Suggested source type: {intentPreset.sourceType}</div>
              <div className="mt-1">Upload supporting screenshot or document after checking the official source.</div>
              <div className="mt-1">Guidance only - not official property verification.</div>
              {intentPreset.sourceUrl ? (
                <a
                  className="mt-2 inline-flex rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-800 hover:bg-blue-100"
                  href={intentPreset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intentPreset.sourceActionLabel}
                </a>
              ) : (
                <button
                  className="mt-2 rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-800 opacity-60"
                  type="button"
                  disabled
                >
                  {intentPreset.sourceActionLabel}
                </button>
              )}
              {intentPreset.note ? <div className="mt-1">{intentPreset.note}</div> : null}
            </div>
          ) : null}

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <label className="text-xs text-slate-600 md:col-span-3">
              Files
              <input
                className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.kml,.geojson,.json,.csv"
                onChange={(e) => handleFileChange(e.target.files || null)}
              />
            </label>

            <AdminButton type="submit" variant="primary" className="h-10" disabled={uploading || !hasPendingQueueItems}>
              {uploading ? 'Yükleniyor...' : 'Sıradaki dosyaları yükle'}
            </AdminButton>
          </form>

          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Uploaded evidence is supporting informational evidence only. It is not official legal, tapu, cadastral or zoning confirmation and must be reviewed before being used as verified analysis input.
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">OCR-assisted classification</div>
            <div className="mt-1">Planned / not active yet. Current suggestions are filename-based and require confirmation.</div>
            <div className="mt-1">Future OCR or AI suggestions will remain editable metadata suggestions only and will not provide official verification.</div>
          </div>

          {showReturnToResult && returnToResult ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <div className="font-semibold text-emerald-900">Upload completed</div>
              <button
                type="button"
                className="mt-2 inline-flex rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                onClick={() => navigate(`/properties/${id}/result`)}
              >
                Return to result
              </button>
            </div>
          ) : null}

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">TKGM Evidence Capture</div>
            <div className="mt-1">
              TKGM evidence is uploaded manually by the user/admin and is supporting informational evidence only. ParselRadar does not automate TKGM access, does not bypass restrictions, and does not confirm official legal/tapu/cadastral/zoning proof.
            </div>
            <a
              className="mt-2 inline-flex rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              href="https://parselsorgu.tkgm.gov.tr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open TKGM Parsel Sorgu
            </a>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Upload Queue</div>
            <div className="text-xs text-slate-600">
              Suggestions are deterministic and editable. They are supporting metadata suggestions only and not verified facts.
            </div>
            <div className="text-xs text-slate-600">
              OCR-assisted classification is planned but not active in this phase.
            </div>
            {uploadQueue.length === 0 ? <div className="text-xs text-slate-500">No files queued. Upload supporting screenshot or document.</div> : null}
            <div className="space-y-2">
              {uploadQueue.map((item) => {
                const isCsv = getFileExtension(item.file.name) === 'csv' || String(item.file.type || '').toLowerCase().includes('csv');
                return (
                  <div key={item.id} className="rounded border border-slate-200 p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-900 break-all">{item.file.name}</div>
                      <div className="text-xs text-slate-500">{formatBytes(item.file.size)} • {item.file.type || 'unknown'}</div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">Extension: {getFileExtension(item.file.name)}</div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <label className="text-xs text-slate-600">
                        Suggested evidence type
                        <select
                          className="mt-1 block w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white"
                          value={item.evidenceType}
                          onChange={(e) => updateQueueItem(item.id, { evidenceType: e.target.value })}
                          disabled={item.status === 'uploading' || item.status === 'uploaded'}
                        >
                          {evidenceTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-600">
                        Suggested source type
                        <select
                          className="mt-1 block w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white"
                          value={item.sourceType}
                          onChange={(e) => updateQueueItem(item.id, { sourceType: e.target.value })}
                          disabled={item.status === 'uploading' || item.status === 'uploaded'}
                        >
                          {sourceTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs text-slate-600">
                        Suggested metadata status
                        <select
                          className="mt-1 block w-full border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white"
                          value={item.metadataStatus}
                          onChange={(e) => updateQueueItem(item.id, { metadataStatus: e.target.value as 'NEEDS_REVIEW' | 'PREVIEW_ONLY' })}
                          disabled={item.status === 'uploading' || item.status === 'uploaded'}
                        >
                          {metadataStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.supportingEvidenceOnly}
                          onChange={(e) => updateQueueItem(item.id, { supportingEvidenceOnly: e.target.checked })}
                          disabled={item.status === 'uploading' || item.status === 'uploaded'}
                        />
                        Supporting evidence only
                      </label>
                      <span className="inline-flex rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-slate-700">
                        Status: {item.status}
                      </span>
                      {item.error ? <span className="text-rose-700">{item.error}</span> : null}
                    </div>

                    {isCsv ? (
                      <div className="mt-2 rounded border border-slate-300 bg-slate-50 p-2 text-xs text-slate-700">
                        CSV preview is available, but CSV upload is not enabled yet. Export or screenshot evidence can still be uploaded.
                      </div>
                    ) : null}

                    <div className="mt-2">
                      <AdminButton
                        type="button"
                        variant="danger"
                        disabled={item.status === 'uploading'}
                        onClick={() => removeQueueItem(item.id)}
                      >
                        Remove from queue
                      </AdminButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-2 flex flex-wrap gap-2">
          <AdminButton variant="secondary" onClick={() => navigate(`/properties/${id}`)}>
            Mülk Detayı
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate(`/properties/${id}/consent`)}>
            Devam: Açık Rıza
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate(`/properties/${id}/result`)}>
            Sonuç
          </AdminButton>
        </div>
      </AdminSurface>
    </AdminPage>
  );
}
