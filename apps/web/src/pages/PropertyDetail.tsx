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
    status?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface DetailResponse {
    property: Property;
    owner?: { email?: string; name?: string; role?: string };
    documents: Array<{
      _id: string;
      documentType: string;
      originalName: string;
      uploadedAt: string;
    }>;
    analyses: Array<{
      _id: string;
      productType: string;
      score: number;
      signal: string;
      createdAt: string;
    }>;
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

  useEffect(() => {
    if (!resolvedId) return;
    apiFetch(`properties/${resolvedId}`)
      .then((data) => setDetail(data as DetailResponse))
      .catch((err) => setError((err as { error?: string }).error || 'Detay yüklenemedi'));
  }, [resolvedId]);

  if (isAdminPath && user?.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!detail) return <div className="text-center mt-20">Yükleniyor...</div>;

  const { property, owner, documents, analysisSummary, analyses, auditReferences } = detail;

  const formatMoney = (value?: number) =>
    typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL` : '-';

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded shadow overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Mülk İnceleme</h2>
          <p className="text-sm text-gray-600 break-words">{property.addressText || 'Adres girilmemiş'} - {property.il}/{property.ilce}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-gray-100 border">Durum: {property.status || 'NEW'}</span>
      </div>

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
          <h3 className="font-semibold mb-2">Yüklenen Belgeler</h3>
          {documents.length === 0 ? (
            <div className="text-gray-500">Belge bulunamadı</div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc._id} className="border rounded p-2">
                  <div className="font-medium break-words">{doc.documentType}</div>
                  <div className="text-gray-700 break-words">{doc.originalName}</div>
                  <div className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">Analiz Özeti</h3>
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
        <Link to={`/properties/${resolvedId}/result`} className="bg-indigo-600 text-white px-3 py-2 rounded text-sm">Re-run Analysis</Link>
        <Link to={`/properties/${resolvedId}/documents`} className="bg-gray-800 text-white px-3 py-2 rounded text-sm">View Documents</Link>
      </div>

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
