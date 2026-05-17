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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    setError('');
    apiFetch(`admin/properties/${propertyId}`)
      .then((data) => {
        const detail = data as DetailResponse;
        setDocuments(Array.isArray(detail.documents) ? detail.documents : []);
        setTitle(
          detail.property
            ? `${detail.property.addressText || 'Adres girilmemiş'} - ${detail.property.il || '-'} / ${detail.property.ilce || '-'}`
            : ''
        );
      })
      .catch((e) => {
        setError((e as { error?: string; message?: string }).error || (e as Error).message || 'Belge listesi alınamadı');
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

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
                {!doc.hasFile ? 'File path missing - re-upload required' : doc.isPdf ? 'PDF document' : 'File preview not available'}
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
