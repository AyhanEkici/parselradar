import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch, getApiBaseUrl } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminLayout,
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

type DocumentItem = {
  _id: string;
  documentType: string;
  evidenceType?: string;
  sourceType?: string;
  reviewStatus?: string;
  metadataStatus?: string;
  supportingEvidenceOnly?: boolean;
  csvDetectedFields?: string[];
  originalName: string;
  uploadedAt?: string;
  createdAt?: string;
  mimeType?: string;
  fileUrl?: string;
  downloadUrl?: string;
  storedName?: string;
  fileMissing?: boolean;
  sizeBytes?: number;
};

type DetailResponse = {
  property?: {
    addressText?: string;
    il?: string;
    ilce?: string;
  };
  documents?: DocumentItem[];
};

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
  return 'Unknown';
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

export default function AdminPropertyDocuments() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [showReturnToResult, setShowReturnToResult] = useState(false);
  const [propertyLocation, setPropertyLocation] = useState<{ province?: string; district?: string }>({});
  const toast = useToast();
  const intentPreset = useMemo(
    () => resolveUploadIntentPreset(searchParams.get('intent'), propertyLocation.province, propertyLocation.district),
    [searchParams, propertyLocation]
  );
  const returnToResult = String(searchParams.get('returnTo') || '').toLowerCase() === 'result';

  const fetchDocuments = async () => {
    if (!propertyId) return;
    setLoading(true);
    const data = (await apiFetch(`admin/properties/${propertyId}`)) as DetailResponse;
    setDocuments(Array.isArray(data.documents) ? data.documents : []);
    setPropertyLocation({ province: data.property?.il, district: data.property?.ilce });
    setTitle(
      data.property
        ? `${data.property.addressText || 'Adres girilmemiş'} - ${data.property.il || '-'} / ${data.property.ilce || '-'}`
        : ''
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments().catch((e) => {
      toast.error((e as { error?: string; message?: string }).error || (e as Error).message || 'Belge listesi alınamadı');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const updateQueueItem = (itemId: string, update: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...update } : item)));
  };

  const removeQueueItem = (itemId: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!propertyId || uploadQueue.length === 0) return;

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
          const response = await fetch(`${getApiBaseUrl()}/properties/${propertyId}/documents`, {
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
        toast.success(`${uploadedCount} document(s) uploaded`);
      } else if (uploadedCount > 0 && failedCount > 0) {
        toast.success(`${uploadedCount} uploaded, ${failedCount} failed`);
      } else {
        toast.error('Upload failed');
      }
      if (uploadedCount > 0 && returnToResult) {
        setShowReturnToResult(true);
      }
      await fetchDocuments();
    } catch (err) {
      const e = err as { message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!propertyId) return;
    setDeletingId(documentId);
    const loadingToastId = toast.loading('Belge siliniyor...');
    try {
      await apiFetch(`properties/${propertyId}/documents/${documentId}`, { method: 'DELETE' });
      toast.dismiss(loadingToastId);
      toast.success('Document deleted');
      await fetchDocuments();
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Silme başarısız');
    } finally {
      setDeletingId('');
    }
  };

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

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

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

  const hasPendingQueueItems = uploadQueue.some((item) => item.status === 'ready' || item.status === 'error');

  return (
    <AdminLayout title="Property Documents">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="p-4 sm:p-5 space-y-5">
        <AdminHeader
          title="Property Documents"
          subtitle={title || 'Belge yönetimi'}
          actions={
            <Link to={`/admin/properties/${propertyId}`} className="text-sm text-blue-600 hover:underline">
              Back to Property Detail
            </Link>
          }
        />

        {loading && <div className="text-sm text-slate-600">Loading documents...</div>}

        <section className="space-y-3">
          <AdminToolbar className="justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Existing Documents</h3>
          </AdminToolbar>

          {!loading && cards.length === 0 ? (
            <AdminEmptyState>No documents uploaded yet</AdminEmptyState>
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
                  <div className="flex flex-wrap gap-1">
                    <span className={`inline-flex rounded border px-2 py-0.5 ${statusClass(doc.reviewStatus)}`}>
                      Review: {statusText(doc.reviewStatus)}
                    </span>
                    <span className={`inline-flex rounded border px-2 py-0.5 ${statusClass(doc.metadataStatus)}`}>
                      Metadata: {statusText(doc.metadataStatus)}
                    </span>
                  </div>
                  {doc.supportingEvidenceOnly ? <div>Supporting evidence only</div> : null}
                  <div>Needs review before verified analysis use.</div>
                  <div className="text-slate-500">Status update endpoint not wired yet.</div>
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
                    <div className="w-full h-40 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
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
                    onClick={() => handleDelete(doc._id)}
                    disabled={deletingId === doc._id}
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
            <h3 className="text-sm font-semibold text-slate-800">Upload New Documents</h3>
          </AdminToolbar>

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
              <div className="mt-1">Upload a screenshot/document as supporting evidence after checking the source.</div>
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
              {uploading ? 'Uploading...' : 'Upload queued files'}
            </AdminButton>
          </form>

          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Uploaded evidence is supporting informational evidence only. It is not official legal, tapu, cadastral or zoning confirmation and must be reviewed before being used as verified analysis input.
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">OCR-assisted classification</div>
            <div className="mt-1">Planned / not active yet. Current suggestions are filename-based and require admin confirmation.</div>
            <div className="mt-1">Future OCR or AI suggestions will remain internal suggestion metadata only and will not provide official verification.</div>
          </div>

          {showReturnToResult && returnToResult ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <div className="font-semibold text-emerald-900">Upload completed</div>
              <button
                type="button"
                className="mt-2 inline-flex rounded border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                onClick={() => navigate(`/properties/${propertyId}/result`)}
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
            {uploadQueue.length === 0 ? <div className="text-xs text-slate-500">No files queued.</div> : null}
            <div className="space-y-2">
              {uploadQueue.map((item) => (
                <div key={item.id} className="rounded border border-slate-200 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900 break-all">{item.file.name}</div>
                    <div className="text-xs text-slate-500">{formatBytes(item.file.size)} • {item.file.type || 'unknown'}</div>
                  </div>
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
              ))}
            </div>
          </div>
        </section>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
