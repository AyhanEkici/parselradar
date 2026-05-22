import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

type CsvPreview = {
  headers: string[];
  detectedFields: Array<{ field: string; value: string }>;
  parseError: string | null;
};

type ReviewStatusValue =
  | 'PREVIEW_ONLY'
  | 'NEEDS_REVIEW'
  | 'CONFIRMED_BY_USER'
  | 'CONFIRMED_BY_ADMIN'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'REJECTED';

const evidenceTypeOptions = [
  'LISTING_SCREENSHOT',
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
  'MUNICIPALITY_IMAR_EVIDENCE',
  'E_PLAN_EVIDENCE',
  'UCBP_TUCBS_INFORMATIONAL_EVIDENCE',
  'LISTING_SOURCE',
  'ADMIN_MANUAL_OBSERVATION',
  'UNKNOWN',
];

const csvPreviewFields = ['title', 'longitude', 'latitude', '_id_', 'province', 'district', 'neighborhood', 'ada', 'parsel', 'price', 'm2'];

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsvPreview(content: string): CsvPreview {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], detectedFields: [], parseError: 'CSV preview failed — manual review required' };
  }

  const headers = splitCsvLine(lines[0]);
  if (headers.length === 0) {
    return { headers: [], detectedFields: [], parseError: 'CSV preview failed — manual review required' };
  }

  const firstRow = lines[1] ? splitCsvLine(lines[1]) : [];
  const headerIndex = new Map(headers.map((header, index) => [header.toLowerCase(), index]));

  const detectedFields = csvPreviewFields
    .map((field) => {
      const fieldKey = field.toLowerCase();
      const idx = headerIndex.get(fieldKey);
      if (typeof idx === 'number') {
        return { field, value: firstRow[idx] || '-' };
      }
      if (fieldKey === '_id_') {
        const fallbackIdx = headerIndex.get('_id');
        if (typeof fallbackIdx === 'number') {
          return { field, value: firstRow[fallbackIdx] || '-' };
        }
      }
      return null;
    })
    .filter((entry): entry is { field: string; value: string } => Boolean(entry));

  return { headers, detectedFields, parseError: null };
}

function getFileExtension(filename: string) {
  const normalized = String(filename || '');
  const index = normalized.lastIndexOf('.');
  if (index < 0 || index === normalized.length - 1) return 'unknown';
  return normalized.slice(index + 1).toLowerCase();
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
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [evidenceType, setEvidenceType] = useState('OTHER');
  const [sourceType, setSourceType] = useState('ADMIN_MANUAL_OBSERVATION');
  const [supportingEvidenceOnly, setSupportingEvidenceOnly] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview>({ headers: [], detectedFields: [], parseError: null });
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const fetchDocuments = async () => {
    if (!propertyId) return;
    setLoading(true);
    const data = (await apiFetch(`admin/properties/${propertyId}`)) as DetailResponse;
    setDocuments(Array.isArray(data.documents) ? data.documents : []);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !file) return;

    const parsedPreview = csvPreview.parseError
      ? null
      : Object.fromEntries(csvPreview.detectedFields.map((entry) => [entry.field, entry.value]));
    const csvDetectedFields = csvPreview.parseError ? [] : csvPreview.detectedFields.map((entry) => entry.field);
    const metadataStatus = csvPreview.parseError
      ? 'MANUAL_REVIEW_REQUIRED'
      : csvDetectedFields.length > 0
      ? 'PREVIEW_ONLY'
      : 'NEEDS_REVIEW';

    setUploading(true);
    const loadingToastId = toast.loading('Belge yükleniyor...');
    try {
      const authHeader = getAuthHeader();
      const formData = new FormData();
      formData.append('documentType', evidenceType);
      formData.append('evidenceType', evidenceType);
      formData.append('sourceType', sourceType);
      formData.append('reviewStatus', 'NEEDS_REVIEW');
      formData.append('metadataStatus', metadataStatus);
      formData.append('supportingEvidenceOnly', String(supportingEvidenceOnly));
      if (parsedPreview && Object.keys(parsedPreview).length > 0) {
        formData.append('parsedPreview', JSON.stringify(parsedPreview));
      }
      if (csvDetectedFields.length > 0) {
        formData.append('csvDetectedFields', JSON.stringify(csvDetectedFields));
      }
      formData.append('file', file);
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
        throw new Error(data?.error || 'Yükleme başarısız');
      }
      toast.dismiss(loadingToastId);
      toast.success('Document uploaded');
      setFile(null);
      setCsvPreview({ headers: [], detectedFields: [], parseError: null });
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

  const fileExtension = file ? getFileExtension(file.name) : 'unknown';
  const fileType = file?.type || 'unknown';
  const isCsvFile = fileExtension === 'csv' || fileType.toLowerCase().includes('csv');

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setCsvPreview({ headers: [], detectedFields: [], parseError: null });

    if (!nextFile) return;
    const extension = getFileExtension(nextFile.name);
    const mime = String(nextFile.type || '').toLowerCase();
    const shouldParseCsv = extension === 'csv' || mime.includes('csv');
    if (!shouldParseCsv) return;

    try {
      const content = await nextFile.text();
      setCsvPreview(parseCsvPreview(content));
    } catch {
      setCsvPreview({ headers: [], detectedFields: [], parseError: 'CSV preview failed — manual review required' });
    }
  };

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

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <label className="text-xs text-slate-600 md:col-span-1">
              Evidence type
              <select
                className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
              >
                {evidenceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-600 md:col-span-1">
              Source type
              <select
                className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              >
                {sourceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-600 md:col-span-2">
              File
              <input
                className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.csv"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                required
              />
            </label>

            <AdminButton type="submit" variant="primary" className="h-10" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </AdminButton>
          </form>

          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Uploaded evidence is supporting informational evidence only. It is not official legal, tapu, cadastral or zoning confirmation and must be reviewed before being used as verified analysis input.
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Upload Metadata Preview</div>
            <div>File name: {file?.name || '-'}</div>
            <div>File type: {fileType}</div>
            <div>File extension: {fileExtension}</div>
            <div>Selected evidence type: {evidenceType}</div>
            <div>Selected source type: {sourceType}</div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={supportingEvidenceOnly}
                onChange={(e) => setSupportingEvidenceOnly(e.target.checked)}
              />
              Supporting evidence only
            </label>
            <div className="text-amber-700">Manual review required</div>
            {isCsvFile ? <div className="text-slate-600">Preview only / needs confirmation</div> : null}
          </div>

          {isCsvFile ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="font-semibold text-slate-900">CSV Preview</div>
              {csvPreview.parseError ? (
                <div className="mt-2 text-rose-700">CSV preview failed — manual review required</div>
              ) : (
                <>
                  <div className="mt-2 text-slate-700">Detected headers: {csvPreview.headers.length > 0 ? csvPreview.headers.join(', ') : '-'}</div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 px-2 py-1 text-left">Field</th>
                          <th className="border border-slate-200 px-2 py-1 text-left">Preview value (first row)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.detectedFields.length > 0 ? (
                          csvPreview.detectedFields.map((entry) => (
                            <tr key={entry.field}>
                              <td className="border border-slate-200 px-2 py-1">{entry.field}</td>
                              <td className="border border-slate-200 px-2 py-1">{entry.value}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border border-slate-200 px-2 py-1" colSpan={2}>No target preview fields found. Manual review required.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </section>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
