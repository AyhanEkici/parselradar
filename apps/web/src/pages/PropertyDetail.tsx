import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function PropertyDetail() {
  const { id, propertyId } = useParams();
  const resolvedId = propertyId || id;
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin/');

  interface Property {
    _id: string;
    userId: string;
    addressText?: string;
    il: string;
    ilce: string;
    mahalleOrKoy?: string;
    askingPriceTRY?: number;
    areaM2?: number;
    pricePerM2?: number;
    ada?: string;
    parsel?: string;
    pafta?: string;
    nitelik?: string;
    zoningStatus: string;
    tapuType: string;
    roadAccess?: string;
    electricity?: string;
    water?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface DetailResponse {
    property: Property;
    owner?: { email?: string; name?: string; role?: string };
    creator?: { email?: string; name?: string; role?: string };
    creationSource?: string;
    generatedPropertyTitle?: string;
    titleDerivation?: {
      ownerName?: string;
      address?: string;
      city?: string;
      district?: string;
    };
    documents: Array<{
      _id: string;
      documentType: string;
      originalName: string;
      createdAt?: string;
      uploadedAt: string;
      fileUrl?: string;
      downloadUrl?: string;
      fileMissing?: boolean;
    }>;
    analyses: Array<{
      _id: string;
      productType: string;
      score: number;
      signal: string;
      createdAt: string;
      previewSummary?: Record<string, unknown>;
    }>;
    latestAnalysis?: {
      _id: string;
      productType: string;
      score: number;
      signal: string;
      createdAt: string;
      previewSummary?: Record<string, unknown>;
    };
    analysisSummary?: {
      quickScore?: { score: number; signal: string; createdAt: string } | null;
      parcelInsight?: { score: number; signal: string; createdAt: string } | null;
      developerFit?: { score: number; signal: string; createdAt: string } | null;
    };
    auditReferences: Array<{
      _id: string;
      type: string;
      message: string;
      success?: boolean;
      createdAt: string;
    }>;
  }

  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [error, setError] = useState('');
  const [rerunLoading, setRerunLoading] = useState(false);
  const [rerunError, setRerunError] = useState('');
  const [statusValue, setStatusValue] = useState('NEW');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const normalizeDetail = (data: unknown): DetailResponse => {
    const maybe = data as Partial<DetailResponse> & Record<string, unknown>;
    if (maybe && typeof maybe === 'object' && maybe.property) {
      return {
        property: maybe.property as DetailResponse['property'],
        owner: maybe.owner,
        creator: maybe.creator,
        creationSource: (maybe.creationSource as string) || '-',
        generatedPropertyTitle: (maybe.generatedPropertyTitle as string) || '-',
        titleDerivation: maybe.titleDerivation as DetailResponse['titleDerivation'],
        documents: Array.isArray(maybe.documents) ? maybe.documents : [],
        analyses: Array.isArray(maybe.analyses) ? maybe.analyses : [],
        latestAnalysis: maybe.latestAnalysis as DetailResponse['latestAnalysis'],
        analysisSummary: maybe.analysisSummary,
        auditReferences: Array.isArray(maybe.auditReferences) ? maybe.auditReferences : [],
      };
    }

    return {
      property: maybe as DetailResponse['property'],
      owner: undefined,
      creator: undefined,
      creationSource: '-',
      generatedPropertyTitle: '-',
      titleDerivation: undefined,
      documents: [],
      analyses: [],
      latestAnalysis: undefined,
      analysisSummary: undefined,
      auditReferences: [],
    };
  };

  const fetchDetail = async () => {
    if (!resolvedId) return;
    setError('');
    const endpoint = isAdminPath ? `admin/properties/${resolvedId}` : `properties/${resolvedId}`;
    const data = await apiFetch(endpoint);
    const normalized = normalizeDetail(data);
    setDetail(normalized);
    setStatusValue(normalized.property?.status || 'NEW');
  };

  useEffect(() => {
    fetchDetail().catch((err) => setError((err as { error?: string }).error || 'Detay yüklenemedi'));
  }, [resolvedId, isAdminPath]);

  const rerunAnalysis = async () => {
    if (!resolvedId) return;
    setRerunLoading(true);
    setRerunError('');
    try {
      await apiFetch(`analysis/${resolvedId}/quick-score?force=1`, { method: 'POST' });
      await fetchDetail();
    } catch (err) {
      const e = err as { error?: string; message?: string };
      setRerunError(e.error || e.message || 'Analiz başarısız');
    } finally {
      setRerunLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!resolvedId) return;
    setStatusUpdating(true);
    setStatusError('');
    setStatusSuccess('');
    try {
      await apiFetch(`admin/properties/${resolvedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue }),
      });
      setStatusSuccess('Status updated');
      await fetchDetail();
    } catch (err) {
      const e = err as { error?: string; message?: string };
      setStatusError(e.error || e.message || 'Status update failed');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isAdminPath && user?.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!detail) return <div className="text-center mt-20">Yükleniyor...</div>;

  const { property, owner, creator, creationSource, generatedPropertyTitle, titleDerivation, documents, analysisSummary, analyses, auditReferences, latestAnalysis } = detail;

  const formatMoney = (value?: number) =>
    typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL` : '-';

  const latestSummary = latestAnalysis?.previewSummary || {};
  const latestExplanation =
    String((latestSummary['summary'] as string) || (latestSummary['explanation'] as string) || '').trim() || '-';
  const latestReused =
    typeof latestSummary['reused'] === 'boolean' ? (latestSummary['reused'] ? 'Yes' : 'No') : '-';
  const factorRoad = property.roadAccess || '-';
  const factorUtilities = `E:${property.electricity || '-'} / W:${property.water || '-'}`;
  const factorDocuments = String(documents.length);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded shadow overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Mülk İnceleme</h2>
          <p className="text-sm text-gray-600 break-words">{property.addressText || 'Adres girilmemiş'} - {property.il}/{property.ilce}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 border">Durum: {property.status || 'NEW'}</span>
      </div>

      {isAdminPath && (
        <section className="border rounded p-4 mb-4 bg-blue-50">
          <h3 className="font-semibold mb-3">Review Status</h3>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Status</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={statusValue}
                onChange={(e) => {
                  setStatusValue(e.target.value);
                  setStatusSuccess('');
                  setStatusError('');
                }}
              >
                <option value="NEW">NEW</option>
                <option value="REVIEWING">REVIEWING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
            <button
              onClick={updateStatus}
              disabled={statusUpdating || statusValue === (property.status || 'NEW')}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
            >
              {statusUpdating ? 'Saving...' : 'Save Status'}
            </button>
          </div>
          {statusSuccess && <div className="text-xs text-green-700 mt-2">{statusSuccess}</div>}
          {statusError && <div className="text-xs text-red-700 mt-2">{statusError}</div>}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Sahiplik</h3>
          <div>Ad Soyad: {owner?.name || '-'}</div>
          <div className="break-all">E-posta: {owner?.email || '-'}</div>
          <div>Rol: {owner?.role || '-'}</div>
          <div className="mt-2 text-xs text-gray-500">Oluşturulma: {new Date(property.createdAt).toLocaleString()}</div>
          <div className="text-xs text-gray-500">Güncelleme: {new Date(property.updatedAt).toLocaleString()}</div>
        </section>

        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Parsel ve Konum</h3>
          <div>İl / İlçe: {property.il} / {property.ilce}</div>
          <div>Mahalle/Köy: {property.mahalleOrKoy || '-'}</div>
          <div>Ada / Parsel: {property.ada || '-'} / {property.parsel || '-'}</div>
          <div>Pafta: {property.pafta || '-'}</div>
          <div>Nitelik: {property.nitelik || '-'}</div>
        </section>

        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Fiyatlama ve İmar</h3>
          <div>Fiyat: {formatMoney(property.askingPriceTRY)}</div>
          <div>Alan: {property.areaM2 || '-'} m²</div>
          <div>m² Fiyatı: {formatMoney(property.pricePerM2)}</div>
          <div>İmar Durumu: {property.zoningStatus}</div>
          <div>Tapu Türü: {property.tapuType}</div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 text-sm">
        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Generated Property Title</h3>
          <div className="font-medium break-words">{generatedPropertyTitle || '-'}</div>
          <div className="mt-2 text-xs text-gray-700">Derived from:</div>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            <li>ownerName: {titleDerivation?.ownerName || '-'}</li>
            <li>address: {titleDerivation?.address || '-'}</li>
            <li>city: {titleDerivation?.city || '-'}</li>
            <li>district: {titleDerivation?.district || '-'}</li>
          </ul>
          <div className="mt-2 text-xs text-gray-700">Creation source: {creationSource || '-'}</div>
          <div className="text-xs text-gray-700">Creator: {creator?.name || '-'} ({creator?.email || '-'})</div>
        </section>

        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Yüklenen Belgeler</h3>
          {documents.length === 0 ? (
            <div className="text-gray-500">No documents uploaded yet</div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc._id} className="border rounded p-2">
                  <div className="font-medium break-words">{doc.documentType}</div>
                  <div className="text-gray-700 break-words">{doc.originalName}</div>
                  <div className="text-xs text-gray-500">{new Date(doc.createdAt || doc.uploadedAt).toLocaleString()}</div>
                  {!doc.fileUrl || doc.fileMissing ? (
                    <div className="text-xs text-red-600 mt-1">Legacy file missing — re-upload required</div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <Link
              to={isAdminPath ? `/admin/properties/${resolvedId}/documents` : `/properties/${resolvedId}/documents`}
              className="inline-flex bg-gray-800 text-white px-3 py-2 rounded text-sm"
            >
              Upload documents
            </Link>
          </div>
        </section>

        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Rule-based preliminary analysis</h3>
          <div className="text-xs text-amber-700 mb-2">
            This is not a certified valuation. It is based only on submitted fields and uploaded documents currently available to the system.
          </div>
          <div className="border rounded p-2 mb-2 bg-gray-50">
            <div className="font-medium">Latest Analysis</div>
            <div>Score: {latestAnalysis?.score ?? '-'}</div>
            <div>Signal: {latestAnalysis?.signal || '-'}</div>
            <div>Reused: {latestReused}</div>
            <div className="break-words">Explanation: {latestExplanation}</div>
            <div className="text-xs text-gray-500">{latestAnalysis?.createdAt ? new Date(latestAnalysis.createdAt).toLocaleString() : '-'}</div>
          </div>
          <div className="border rounded p-2 mb-2 bg-white">
            <div className="font-medium">Input factors used</div>
            <div>price: {formatMoney(property.askingPriceTRY)}</div>
            <div>area: {property.areaM2 || '-'} m²</div>
            <div>zoning: {property.zoningStatus || '-'}</div>
            <div>road: {factorRoad}</div>
            <div>utilities: {factorUtilities}</div>
            <div>documents count: {factorDocuments}</div>
          </div>
          <div className="space-y-2">
            <div className="border rounded p-2">
              <div className="font-medium">Quick Score</div>
              <div>Skor: {analysisSummary?.quickScore?.score ?? '-'}</div>
              <div>Signal: {analysisSummary?.quickScore?.signal ?? '-'}</div>
              <div className="text-xs text-gray-500">{analysisSummary?.quickScore?.createdAt ? new Date(analysisSummary.quickScore.createdAt).toLocaleString() : '-'}</div>
            </div>
            <div className="border rounded p-2">
              <div className="font-medium">Parcel Insight</div>
              <div>Skor: {analysisSummary?.parcelInsight?.score ?? '-'}</div>
              <div>Signal: {analysisSummary?.parcelInsight?.signal ?? '-'}</div>
              <div className="text-xs text-gray-500">{analysisSummary?.parcelInsight?.createdAt ? new Date(analysisSummary.parcelInsight.createdAt).toLocaleString() : '-'}</div>
            </div>
            <div className="border rounded p-2">
              <div className="font-medium">Developer Fit</div>
              <div>Skor: {analysisSummary?.developerFit?.score ?? '-'}</div>
              <div>Signal: {analysisSummary?.developerFit?.signal ?? '-'}</div>
              <div className="text-xs text-gray-500">{analysisSummary?.developerFit?.createdAt ? new Date(analysisSummary.developerFit.createdAt).toLocaleString() : '-'}</div>
            </div>
          </div>
        </section>
      </div>

      <section className="border rounded p-4 mt-4 text-sm">
        <h3 className="font-semibold mb-2">Audit Referansları</h3>
        {auditReferences.length === 0 ? (
          <div className="text-gray-500">Audit kaydı bulunamadı</div>
        ) : (
          <ul className="space-y-2">
            {auditReferences.map((a) => (
              <li key={a._id} className="border rounded p-2">
                <div className="font-medium">{a.type}</div>
                <div className="break-words">{a.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(a.createdAt).toLocaleString()} - {a.success ? 'Başarılı' : 'Başarısız'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/properties/${resolvedId}/result`} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">Open Analysis</Link>
        <button
          onClick={rerunAnalysis}
          disabled={rerunLoading}
          className="bg-indigo-600 text-white px-3 py-2 rounded text-sm disabled:opacity-60"
        >
          {rerunLoading ? 'Running...' : 'Re-run Analysis'}
        </button>
        <Link to={isAdminPath ? `/admin/properties/${resolvedId}/documents` : `/properties/${resolvedId}/documents`} className="bg-gray-800 text-white px-3 py-2 rounded text-sm">View Documents</Link>
        <Link to={`/properties/${resolvedId}/documents`} className="bg-emerald-700 text-white px-3 py-2 rounded text-sm">Upload Documents</Link>
      </div>
      {rerunError && <div className="mt-2 text-sm text-red-600">{rerunError}</div>}

      {analyses.length > 0 && (
        <div className="mt-4 text-xs text-gray-600">
          Toplam analiz kaydı: {analyses.length}
        </div>
      )}
      <div className="mt-2">
        <Link to="/admin/properties" className="text-sm text-blue-600 hover:underline">← Admin mülk listesine dön</Link>
      </div>
    </div>
  );
}
