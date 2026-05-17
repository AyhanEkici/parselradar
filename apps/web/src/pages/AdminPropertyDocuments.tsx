import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminToolbar,
} from '../components/admin';

type DocumentItem = {
  _id: string;
  documentType: string;
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

function absoluteFileUrl(fileUrl?: string) {
  if (!fileUrl) return '';
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [documentType, setDocumentType] = useState('OTHER');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});

  const docTypes = [
    'ONLINE_IMAR_DURUM_BELGESI',
    'BELEDIYE_IMAR_DURUM_BELGESI',
    'TAPU_SENEDI',
    'TAKYIDAT_BELGESI',
    'TKGM_PARSEL_SCREENSHOT',
    'E_IMAR_SCREENSHOT',
    'ILAN_SCREENSHOT',
    'PLAN_NOTLARI',
    'RUHSAT',
    'ISKAN',
    'KAT_IRTIFAKI_TAPUSU',
    'KAT_MULKIYETI_TAPUSU',
    'TAPU_KAYIT_BELGESI',
    'OTHER',
  ];

  const fetchDocuments = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError('');
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
      setError((e as { error?: string; message?: string }).error || (e as Error).message || 'Belge listesi alınamadı');
      setLoading(false);
    });
  }, [propertyId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('parselradar_token') : null;
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '')}/properties/${propertyId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) {
        throw new Error(data?.error || 'Yükleme başarısız');
      }
      setSuccess('Document uploaded');
      setFile(null);
      await fetchDocuments();
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!propertyId) return;
    setDeletingId(documentId);
    setError('');
    setSuccess('');
    try {
      await apiFetch(`properties/${propertyId}/documents/${documentId}`, { method: 'DELETE' });
      setSuccess('Document deleted');
      await fetchDocuments();
    } catch (err) {
      const e = err as { error?: string; message?: string };
      setError(e.error || e.message || 'Silme başarısız');
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('parselradar_token') : null;
      const failed: Record<string, string> = {};

      await Promise.all(
        cards.map(async (doc) => {
          if (!doc.isImage || !doc.hasFile || !doc.fileHref) return;
          try {
            const response = await fetch(doc.fileHref, {
              method: 'GET',
              credentials: 'include',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  if (!user || user.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  return (
    <AdminPage>
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
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-emerald-600">{success}</div>}

        <section className="space-y-3">
          <AdminToolbar className="justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Existing Documents</h3>
          </AdminToolbar>

          {!loading && !error && cards.length === 0 ? (
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
              Document type
              <select
                className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {docTypes.map((type) => (
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
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>

            <AdminButton type="submit" variant="primary" className="h-10" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </AdminButton>
          </form>
        </section>
      </AdminSurface>
    </AdminPage>
  );
}
