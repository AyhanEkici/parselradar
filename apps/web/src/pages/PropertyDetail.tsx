import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui';

// Score Gauge Component
const ScoreGauge = ({ score, confidence }: { score: number; confidence: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="60" y="65" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
          {score}
        </text>
      </svg>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-700">Score</div>
        <div className="text-xs text-gray-500">Confidence: {confidence}%</div>
      </div>
    </div>
  );
};

// Document Modal Component
const DocumentModal = ({
  isOpen,
  doc,
  onClose,
}: {
  isOpen: boolean;
  doc: any;
  onClose: () => void;
}) => {
  if (!isOpen || !doc) return null;

  const isImage = ['jpeg', 'jpg', 'png', 'gif', 'webp'].some((ext) =>
    doc.originalName.toLowerCase().endsWith(`.${ext}`)
  );
  const isPdf = doc.originalName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold truncate">{doc.originalName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <img
              src={doc.fileUrl}
              alt={doc.originalName}
              className="max-w-full max-h-full mx-auto"
            />
          )}
          {isPdf && (
            <iframe
              src={doc.fileUrl}
              title={doc.originalName}
              className="w-full h-full border-0"
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">📄</div>
              <p>File type not displayable in preview</p>
              <a
                href={doc.downloadUrl || doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Item Component
const TimelineItem = ({
  item,
  isExpanded,
  onToggle,
}: {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const getIcon = (type: string) => {
    if (type.includes('analysis')) return '📊';
    if (type.includes('document')) return '📄';
    if (type.includes('status')) return '🔄';
    if (type.includes('credit')) return '💳';
    return '📌';
  };

  const getColor = (success: boolean) =>
    success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';

  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all ${getColor(
        item.success !== false
      )} ${isExpanded ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{getIcon(item.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-sm text-gray-800 truncate">{item.type}</div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs text-gray-700 line-clamp-2 mt-1">{item.message}</div>
          {isExpanded && item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20 text-xs bg-white bg-opacity-50 p-2 rounded">
              <details className="space-y-1">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Metadata
                </summary>
                {Object.entries(item.metadata).map(([k, v]) => (
                  <div key={k} className="text-gray-600 ml-2">
                    <span className="font-medium">{k}:</span> {JSON.stringify(v)}
                  </div>
                ))}
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
      confidence?: number;
      strengths?: string[];
      risks?: string[];
      missingInputs?: string[];
      recommendation?: string;
      factorsUsed?: Record<string, any>;
      createdAt: string;
      previewSummary?: Record<string, unknown>;
    }>;
    latestAnalysis?: {
      _id: string;
      productType: string;
      score: number;
      signal: string;
      confidence?: number;
      strengths?: string[];
      risks?: string[];
      missingInputs?: string[];
      recommendation?: string;
      factorsUsed?: Record<string, any>;
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
      metadata?: Record<string, any>;
    }>;
  }

  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [error, setError] = useState('');
  const [rerunLoading, setRerunLoading] = useState(false);
  const [statusValue, setStatusValue] = useState('NEW');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const toast = useToast();

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
    fetchDetail().catch((err) =>
      setError((err as { error?: string }).error || 'Detay yüklenemedi')
    );
  }, [resolvedId, isAdminPath]);

  const rerunAnalysis = async () => {
    if (!resolvedId) return;
    setRerunLoading(true);
    const loadingToastId = toast.loading('Analiz yeniden çalıştırılıyor...');
    try {
      await apiFetch(`analysis/${resolvedId}/quick-score?force=1`, { method: 'POST' });
      await fetchDetail();
      toast.dismiss(loadingToastId);
      toast.success('Analiz güncellendi');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Analiz başarısız');
    } finally {
      setRerunLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!resolvedId) return;
    setStatusUpdating(true);
    const loadingToastId = toast.loading('Durum güncelleniyor...');
    try {
      await apiFetch(`admin/properties/${resolvedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatusValue(newStatus);
      await fetchDetail();
      toast.dismiss(loadingToastId);
      toast.success('Status updated');
    } catch (err) {
      const e = err as { error?: string; message?: string };
      toast.dismiss(loadingToastId);
      toast.error(e.error || e.message || 'Status update failed');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isAdminPath && user?.role !== 'ADMIN') {
    return <div className="text-center mt-20">Yönetici yetkisi gerekli</div>;
  }

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!detail) return <div className="text-center mt-20">Yükleniyor...</div>;

  const {
    property,
    owner,
    creator,
    creationSource,
    generatedPropertyTitle,
    titleDerivation,
    documents,
    auditReferences,
    latestAnalysis,
  } = detail;

  const formatMoney = (value?: number) =>
    typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL` : '-';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 break-words mb-2">
                {generatedPropertyTitle || 'Property'}
              </h1>
              <p className="text-lg text-gray-600 break-words mb-3">
                {property.addressText || 'No address'} • {property.il}/{property.ilce}
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    property.status || 'NEW'
                  )}`}
                >
                  {property.status || 'NEW'}
                </span>
                {latestAnalysis && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    Analysis Ready
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold uppercase">Price</div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatMoney(property.askingPriceTRY)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-600 font-semibold uppercase">Area</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {property.areaM2 || '-'} m²
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold uppercase">Price/m²</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatMoney(property.pricePerM2)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-semibold uppercase">Docs</div>
                <div className="text-2xl font-bold text-orange-900">{documents.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Admin Actions */}
      {isAdminPath && (
        <div className="sticky top-0 z-40 bg-white border-b shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => updateStatus('REVIEWING')}
                disabled={statusUpdating || statusValue === 'REVIEWING'}
                className="px-4 py-2 rounded text-sm font-semibold bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                👁 Reviewing
              </button>
              <button
                onClick={() => updateStatus('APPROVED')}
                disabled={statusUpdating || statusValue === 'APPROVED'}
                className="px-4 py-2 rounded text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => updateStatus('REJECTED')}
                disabled={statusUpdating || statusValue === 'REJECTED'}
                className="px-4 py-2 rounded text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                ✕ Reject
              </button>
              <button
                onClick={rerunAnalysis}
                disabled={rerunLoading}
                className="px-4 py-2 rounded text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                📊 Rerun Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Analysis Section */}
        {latestAnalysis && (
          <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Rule-Based Analysis</h2>

            <div className="text-sm text-amber-700 mb-6 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>⚠️ DISCLAIMER:</strong> This is a preliminary rule-based analysis, NOT a
              certified valuation. Based on submitted fields and documents only.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="flex justify-center">
                <ScoreGauge score={latestAnalysis.score} confidence={latestAnalysis.confidence ?? 0} />
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-4xl font-bold px-4 py-2 rounded-lg text-white ${
                      latestAnalysis.signal === 'STRONG'
                        ? 'bg-green-600'
                        : latestAnalysis.signal === 'MODERATE'
                        ? 'bg-yellow-600'
                        : latestAnalysis.signal === 'WEAK'
                        ? 'bg-orange-600'
                        : 'bg-red-600'
                    }`}
                  >
                    {latestAnalysis.signal}
                  </span>
                  <div>
                    <div className="text-sm text-gray-600">Investment Signal</div>
                    <div className="text-gray-900">
                      {latestAnalysis.signal === 'STRONG'
                        ? 'Favorable indicators detected'
                        : latestAnalysis.signal === 'MODERATE'
                        ? 'Mixed indicators, caution advised'
                        : latestAnalysis.signal === 'WEAK'
                        ? 'Concerning patterns identified'
                        : 'Additional review required'}
                    </div>
                  </div>
                </div>

                {latestAnalysis.recommendation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="font-semibold text-blue-900 mb-1">📋 Next Steps:</div>
                    <p className="text-blue-800">{latestAnalysis.recommendation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {latestAnalysis.strengths && latestAnalysis.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {latestAnalysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-green-800">
                        <span className="text-green-600 font-bold flex-shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latestAnalysis.risks && latestAnalysis.risks.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚠</span> Risk Factors
                  </h4>
                  <ul className="space-y-2">
                    {latestAnalysis.risks.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-red-800">
                        <span className="text-red-600 font-bold flex-shrink-0">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {latestAnalysis.factorsUsed && Object.keys(latestAnalysis.factorsUsed).length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Factors Considered:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(latestAnalysis.factorsUsed).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      <span className="font-semibold">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {latestAnalysis.missingInputs && latestAnalysis.missingInputs.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">ℹ</span> Information Gaps
                </h4>
                <ul className="space-y-1 text-sm text-orange-800">
                  {latestAnalysis.missingInputs.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Document Gallery */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Documents & Media</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-2">📁</div>
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setModalOpen(true);
                    }}
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-square flex items-center justify-center group-hover:shadow-lg transition-shadow relative">
                      {['jpeg', 'jpg', 'png', 'gif', 'webp'].some((ext) =>
                        doc.originalName.toLowerCase().endsWith(`.${ext}`)
                      ) ? (
                        <img
                          src={doc.fileUrl}
                          alt={doc.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-4xl">
                          {doc.originalName.toLowerCase().endsWith('.pdf') ? '📕' : '📄'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          👁 Preview
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 truncate group-hover:text-gray-900">
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Link
                  to={
                    isAdminPath
                      ? `/admin/properties/${resolvedId}/documents`
                      : `/properties/${resolvedId}/documents`
                  }
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  📤 Upload Documents
                </Link>
                <button
                  onClick={() => rerunAnalysis()}
                  disabled={rerunLoading}
                  className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {rerunLoading ? 'Running...' : '🔄 Rerun Analysis'}
                </button>
              </div>
            </>
          )}
        </section>

        {/* Property Provenance Section */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Property Provenance</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Generated Title</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 break-words">
                {generatedPropertyTitle || 'N/A'}
              </div>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Title Derivation</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium text-gray-700">Owner:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.ownerName || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">Address:</span>{' '}
                  <span className="text-gray-600 break-words">{titleDerivation?.address || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">City:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.city || '-'}</span>
                </li>
                <li>
                  <span className="font-medium text-gray-700">District:</span>{' '}
                  <span className="text-gray-600">{titleDerivation?.district || '-'}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Creation Metadata</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-900">Source</div>
                  <div className="text-blue-800">{creationSource || 'Unknown'}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-medium text-purple-900">Created By</div>
                  <div className="text-purple-800">
                    {creator?.name || 'Unknown'} ({creator?.email || 'N/A'})
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="font-medium text-emerald-900">Owner</div>
                  <div className="text-emerald-800">
                    {owner?.name || 'Unknown'} ({owner?.email || 'N/A'})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Timeline */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Activity Timeline</h2>

          {auditReferences.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No activity recorded</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...auditReferences]
                .reverse()
                .map((item) => (
                  <TimelineItem
                    key={item._id}
                    item={item}
                    isExpanded={expandedAuditId === item._id}
                    onToggle={() =>
                      setExpandedAuditId(expandedAuditId === item._id ? null : item._id)
                    }
                  />
                ))}
            </div>
          )}
        </section>

        {/* Property Details Grid */}
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Property Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Tapu Type</div>
              <div className="font-semibold text-slate-900">{property.tapuType || '-'}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Zoning</div>
              <div className="font-semibold text-slate-900">{property.zoningStatus || '-'}</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Parcel</div>
              <div className="font-semibold text-slate-900">
                {property.ada && property.parsel ? `${property.ada}/${property.parsel}` : '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 font-semibold uppercase mb-1">Utilities</div>
              <div className="font-semibold text-slate-900">
                E: {property.electricity || '-'} / W: {property.water || '-'}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={modalOpen}
        doc={selectedDoc}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
