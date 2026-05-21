import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import GovernanceBadge from '../components/governance/GovernanceBadge';
import UserScopedNotice from '../components/UserScopedNotice';
import { getApiBaseUrl } from '../lib/api';
import { getAuthToken } from '../lib/authStorage';

interface Report {
  _id: string;
  analysisRunId?: string;
  createdAt?: string;
  reportType?: string;
  creditsCharged?: number;
  governanceClassification?: string;
  trustScore?: number;
  disclosureMode?: string;
  regionalOutlook?: string;
  developmentProbability?: string;
  ingestionComplianceState?: string;
  noFakeActiveProof?: boolean;
  monitoringState?: string;
  opportunityLevel?: string;
  autonomyState?: string;
  reviewQueueDepth?: number;
  suppressionActiveRules?: number;
  cadenceMinutes?: number;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as { error?: string; message?: string }).error || (err as Error).message || 'Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handlePurchase(report: Report) {
    if (!report.analysisRunId) return;
    setBuyingId(report._id);
    setError('');
    try {
      await apiFetch(`/reports/${report.analysisRunId}/purchase-pdf`, { method: 'POST' });
      await loadReports();
    } catch (err) {
      setError((err as { error?: string; message?: string }).error || (err as Error).message || 'PDF satın alma başarısız');
    } finally {
      setBuyingId(null);
    }
  }

  async function handleDownload(report: Report) {
    setDownloadingId(report._id);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${getApiBaseUrl()}/reports/${report._id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `İndirme başarısız (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${report._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message || 'Rapor indirilemedi');
    } finally {
      setDownloadingId(null);
    }
  }

  const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Raporlarım</h2>
      <div className="mb-4"><UserScopedNotice /></div>
      {error ? <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}
      {loading ? <div className="mb-3 text-sm text-slate-500">Raporlar yükleniyor...</div> : null}
      {!loading && sortedReports.length === 0 ? (
        <div className="mb-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Henüz rapor kaydı yok. Yeni bir analiz çalıştırdıktan sonra rapor geçmişiniz burada görünecek.
        </div>
      ) : null}
      <ul className="space-y-2">
        {sortedReports.map(r => (
          <li key={r._id} className="border-b pb-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span>Rapor: {r._id}</span>
              <div className="flex items-center gap-2">
                {r.analysisRunId ? (
                  <Link
                    to={`/map/analysis/${r.analysisRunId}`}
                    className="rounded bg-slate-700 px-3 py-1 text-white"
                  >
                    Map
                  </Link>
                ) : null}
                {r.analysisRunId ? (
                  <button
                    type="button"
                    className="bg-amber-600 text-white px-3 py-1 rounded disabled:opacity-60"
                    disabled={buyingId === r._id}
                    onClick={() => handlePurchase(r)}
                  >
                    {buyingId === r._id ? 'Satın alınıyor...' : 'PDF Satın Al'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
                  disabled={downloadingId === r._id}
                  onClick={() => handleDownload(r)}
                >
                  {downloadingId === r._id ? 'İndiriliyor...' : 'İndir'}
                </button>
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'} | Tür: {r.reportType || '-'} | Kredi: {r.creditsCharged ?? '-'}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <GovernanceBadge classification={r.governanceClassification} />
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Trust: {r.trustScore ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Disclosure: {r.disclosureMode || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Outlook: {r.regionalOutlook || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Dev Prob: {r.developmentProbability || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Ingestion: {r.ingestionComplianceState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">ACTIVE proof: {r.noFakeActiveProof ? 'PASS' : 'FAIL'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Monitoring: {r.monitoringState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Opportunity: {r.opportunityLevel || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Autonomy: {r.autonomyState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Review Queue: {r.reviewQueueDepth ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Suppression: {r.suppressionActiveRules ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Cadence: {r.cadenceMinutes ?? '-'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
