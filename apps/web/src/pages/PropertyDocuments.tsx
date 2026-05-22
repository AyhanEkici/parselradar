import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const docTypes = [
  { key: 'ONLINE_IMAR_DURUM_BELGESI', label: 'Online İmar Durum Belgesi' },
  { key: 'BELEDIYE_IMAR_DURUM_BELGESI', label: 'Belediye İmar Durum Belgesi' },
  { key: 'TAPU_SENEDI', label: 'Tapu Senedi' },
  { key: 'TAKYIDAT_BELGESI', label: 'Takyidat Belgesi' },
  { key: 'TKGM_PARSEL_SCREENSHOT', label: 'TKGM Parsel Sorgu Screenshot' },
  { key: 'E_IMAR_SCREENSHOT', label: 'E-İmar Screenshot' },
  { key: 'ILAN_SCREENSHOT', label: 'İlan Screenshot' },
  { key: 'PLAN_NOTLARI', label: 'Plan Notları' },
  { key: 'RUHSAT', label: 'Ruhsat' },
  { key: 'ISKAN', label: 'İskan' },
  { key: 'KAT_IRTIFAKI_TAPUSU', label: 'Kat İrtifakı Tapusu' },
  { key: 'KAT_MULKIYETI_TAPUSU', label: 'Kat Mülkiyeti Tapusu' },
  { key: 'TAPU_KAYIT_BELGESI', label: 'Tapu Kayıt Belgesi' },
  { key: 'OTHER', label: 'Diğer' },
];

export default function PropertyDocuments() {
  const { id } = useParams();
  const [documents, setDocuments] = useState<
    Array<{
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
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const toast = useToast();

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
      };
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
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

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentType = String(formData.get('documentType') || '');
    setUploadingType(currentType);
    const loadingToastId = toast.loading('Belge yükleniyor...');
    const authHeader = getAuthHeader();
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

      toast.dismiss(loadingToastId);
      toast.success('Belge yüklendi');
      await loadDocuments();
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error(err?.message || 'Yükleme başarısız');
    } finally {
      setUploadingType('');
    }
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

  return (
    <AdminPage>
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
            <h3 className="text-sm font-semibold text-slate-800">Upload New Documents</h3>
          </AdminToolbar>

          <ul className="space-y-2">
            {docTypes.map((dt) => (
              <li key={dt.key}>
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-2 items-center">
                  <input type="hidden" name="documentType" value={dt.key} />
                  <div className="text-sm text-slate-700">{dt.label}</div>
                  <input
                    className="block w-full border border-slate-300 rounded-md px-2.5 py-2 text-sm bg-white"
                    type="file"
                    name="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    required
                  />
                  <AdminButton type="submit" variant="primary" disabled={uploadingType === dt.key}>
                    {uploadingType === dt.key ? 'Yükleniyor...' : 'Yükle'}
                  </AdminButton>
                </form>
              </li>
            ))}
          </ul>
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
