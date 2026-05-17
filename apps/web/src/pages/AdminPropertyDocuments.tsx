import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

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

  if (!user || user.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4 sm:p-6 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-semibold">Property Documents</h2>
          {title && <p className="text-sm text-gray-600 break-words">{title}</p>}
        </div>
        <Link to={`/admin/properties/${propertyId}`} className="text-sm text-blue-600 hover:underline">
          Back to Property Detail
        </Link>
      </div>

      {loading && <div className="text-sm text-gray-600">Loading documents...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <section className="mb-5">
        <h3 className="text-sm font-semibold mb-2">Existing Documents</h3>
        {!loading && !error && cards.length === 0 && (
          <div className="text-sm text-gray-600">No documents uploaded yet</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {cards.map((doc) => (
            <article key={doc._id} className="border rounded-lg p-3 flex flex-col gap-2">
              <div className="text-sm font-medium break-words">{doc.documentType}</div>
              <div className="text-sm text-gray-700 break-words">{doc.originalName}</div>
              <div className="text-xs text-gray-500">{new Date(doc.createdAt || doc.uploadedAt || '').toLocaleString()}</div>

              {doc.isImage && doc.fileHref ? (
                <img src={doc.fileHref} alt={doc.originalName} className="w-full h-40 object-cover rounded border" loading="lazy" />
              ) : (
                <div className="w-full h-40 rounded border bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                  {!doc.hasFile ? 'Legacy file missing — re-upload required' : doc.isPdf ? 'PDF document' : 'File preview not available'}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
                  disabled={!doc.hasFile}
                  onClick={() => {
                    if (doc.hasFile) window.open(doc.fileHref, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Open
                </button>
                <a
                  href={doc.downloadHref || '#'}
                  download={doc.originalName}
                  className={`px-3 py-1 text-xs rounded bg-gray-800 text-white ${!doc.hasFile ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    if (!doc.hasFile) e.preventDefault();
                  }}
                >
                  Download
                </a>
                <button
                  type="button"
                  className="px-3 py-1 text-xs rounded bg-red-600 text-white disabled:opacity-60"
                  onClick={() => handleDelete(doc._id)}
                  disabled={deletingId === doc._id}
                >
                  {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border rounded p-4">
        <h3 className="text-sm font-semibold mb-3">Upload New Documents</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <label className="text-xs text-gray-600 md:col-span-1">
            Document type
            <select
              className="block w-full border rounded px-2 py-2 text-sm"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {docTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-600 md:col-span-2">
            File
            <input
              className="block w-full border rounded px-2 py-2 text-sm"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <button
            type="submit"
            className="h-10 px-3 text-sm rounded bg-indigo-600 text-white disabled:opacity-60"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </section>
    </div>
  );
}
