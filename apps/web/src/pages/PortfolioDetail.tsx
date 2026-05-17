import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import PortfolioSummaryCard from '../components/portfolio/PortfolioSummaryCard';
import PortfolioExposureCard from '../components/portfolio/PortfolioExposureCard';
import PortfolioOpportunityCard from '../components/portfolio/PortfolioOpportunityCard';
import PortfolioHoldingsTable from '../components/portfolio/PortfolioHoldingsTable';
import ExposureBar from '../components/portfolio/ExposureBar';

export default function PortfolioDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const payload = await apiFetch(`investor/portfolio/${id}`);
      setData(payload);
    } catch (err: any) {
      setError(err?.error || 'Portfolio detay yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const removeItem = async (itemId: string) => {
    if (!id) return;
    await apiFetch(`investor/portfolio/${id}/items/${itemId}`, { method: 'DELETE' });
    await load();
  };

  const exposureRows = useMemo(() => {
    const byCity = data?.exposure?.byCity || {};
    return Object.entries(byCity).map(([city, value]) => ({ city, value: Number(value || 0) }));
  }, [data]);

  const maxExposure = useMemo(() => {
    return exposureRows.reduce((m, row) => (row.value > m ? row.value : m), 0);
  }, [exposureRows]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{data.portfolio?.name || 'Portfolio'}</h1>

        {id ? (
          <div>
            <Link
              to={`/investor/portfolio/${id}/analytics`}
              className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open Portfolio Intelligence
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PortfolioSummaryCard title="Holdings" value={data.items?.length || 0} />
          <PortfolioSummaryCard title="Total Value" value={`${Number(data.exposure?.totalValue || 0).toLocaleString('tr-TR')} TL`} />
          <PortfolioSummaryCard title="Avg Opportunity" value={data.opportunity?.averageOpportunity || 0} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PortfolioExposureCard exposure={data.exposure} />
          <PortfolioOpportunityCard opportunity={data.opportunity} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="text-sm font-semibold text-slate-900">City Exposure Bars</div>
          {exposureRows.length === 0 ? (
            <div className="text-xs text-slate-500">No city exposure data.</div>
          ) : (
            exposureRows.map((row) => (
              <ExposureBar key={row.city} label={String(row.city).toUpperCase()} value={row.value} max={maxExposure} />
            ))
          )}
        </div>

        <PortfolioHoldingsTable items={data.items || []} onRemove={removeItem} />
      </div>
    </div>
  );
}
