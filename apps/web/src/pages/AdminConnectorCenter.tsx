import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';

type CenterItem = {
  connectorKey: string;
  sourceName: string;
  officialUrl: string;
  provider: string;
  municipality: string | null;
  province: string | null;
  district: string | null;
  sourceType: string;
  sourceStatus: string;
  legalMode: string;
  accessStatus: string;
  activationState: string;
  legalClassification: string;
  services: string[];
  syncSafety: string;
  lastSync: {
    status: string;
    timestamp: string | null;
    error: string | null;
    responseSummary: Record<string, unknown> | null;
    source: string;
  } | null;
  nextSync: string | null;
  lastScheduledSync: {
    status: string;
    timestamp: string | null;
    error: string | null;
  } | null;
  scheduledSyncActive: boolean;
  failureReason: string | null;
  manualActionRequired: boolean;
  cron: {
    eligible: boolean;
    cadenceMinutes: number | null;
  };
};

export default function AdminConnectorCenter() {
  const { user } = useAuth();
  const [items, setItems] = useState<CenterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncingKey, setSyncingKey] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/connectors/center');
      setItems(Array.isArray(payload?.items) ? payload.items : []);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Connector center could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.connectorKey.localeCompare(b.connectorKey));
  }, [items]);

  const safeSyncEnabled = (item: CenterItem) => {
    return item.syncSafety === 'SAFE_PUBLIC_METADATA' && !item.manualActionRequired && item.legalMode !== 'BLOCKED';
  };

  const guidanceMessage = (item: CenterItem) => {
    if (item.legalMode === 'BLOCKED') return 'Blocked source: login/CAPTCHA/e-Devlet required';
    if (item.manualActionRequired) {
      return 'Manual public source guidance. Not automated property verification. Upload supporting evidence after checking the source.';
    }
    return 'Safe public metadata sync only.';
  };

  const syncNow = async (connectorKey: string) => {
    setSyncingKey(connectorKey);
    setError('');
    try {
      await apiFetch(`/admin/connectors/${connectorKey}/sync-now`, { method: 'POST' });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'Sync run failed');
    } finally {
      setSyncingKey('');
    }
  };

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  const scheduleStateLabel = (item: CenterItem) => {
    if (!item.cron.eligible) return 'Manual/blocked sources are skipped';
    if (!item.scheduledSyncActive) return 'Configured, first run not verified';
    return 'Configured and active';
  };

  return (
    <AdminLayout title="Admin Connector Center">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Admin Connector Center"
            subtitle="Source status, last sync, next sync, failure reason, and manual action requirements."
          />

          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Sync engine is restricted to safe public metadata and GetCapabilities/open datasets only. No TKGM scraping and no e-Devlet bypass.
          </div>

          <div className="rounded border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
            Manual public source guidance. Not automated property verification. Upload supporting evidence after checking the source.
          </div>

          <div className="rounded border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
            <div className="font-semibold">External scheduler configured</div>
            <div className="mt-1">First GitHub Actions run not yet verified.</div>
            <div className="mt-1">Scheduled sync is metadata-only.</div>
            <div className="mt-1">No property-level official verification.</div>
            <div className="mt-1">Manual/blocked sources are skipped.</div>
          </div>

          {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}

          {!loading ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:hidden">
                {sortedItems.map((item) => (
                  <article key={`${item.connectorKey}-mobile`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900 break-all">{item.connectorKey}</div>
                        <div className="text-xs text-slate-600">{item.sourceName}</div>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${item.cron.eligible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {item.cron.eligible ? 'Cron eligible' : 'Skipped by policy'}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700">
                      <div><span className="font-medium">Provider:</span> {item.provider}</div>
                      <div><span className="font-medium">Location:</span> {item.province || 'N/A'} / {item.district || 'N/A'}</div>
                      <div><span className="font-medium">Legal mode:</span> {item.legalMode}</div>
                      <div><span className="font-medium">Source status:</span> {item.sourceStatus}</div>
                      <div><span className="font-medium">Last sync:</span> {item.lastSync?.status || 'N/A'} ({item.lastSync?.timestamp || 'N/A'})</div>
                      <div><span className="font-medium">Scheduler:</span> {scheduleStateLabel(item)}</div>
                      <div className="text-[11px] text-slate-600">{guidanceMessage(item)}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" href={item.officialUrl} target="_blank" rel="noreferrer noopener">
                        Official URL
                      </a>
                      <button
                        type="button"
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => syncNow(item.connectorKey)}
                        disabled={syncingKey === item.connectorKey || !safeSyncEnabled(item)}
                      >
                        {syncingKey === item.connectorKey ? 'Syncing...' : 'Sync now'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Connector</th>
                    <th className="px-3 py-2 text-left font-semibold">Provider / Municipality</th>
                    <th className="px-3 py-2 text-left font-semibold">Province / District</th>
                    <th className="px-3 py-2 text-left font-semibold">Source Type</th>
                    <th className="px-3 py-2 text-left font-semibold">Source Status</th>
                    <th className="px-3 py-2 text-left font-semibold">Legal Mode</th>
                    <th className="px-3 py-2 text-left font-semibold">Access Status</th>
                    <th className="px-3 py-2 text-left font-semibold">Activation State</th>
                    <th className="px-3 py-2 text-left font-semibold">Legal Classification</th>
                    <th className="px-3 py-2 text-left font-semibold">Services</th>
                    <th className="px-3 py-2 text-left font-semibold">Last Sync</th>
                    <th className="px-3 py-2 text-left font-semibold">Next Sync</th>
                    <th className="px-3 py-2 text-left font-semibold">Cron Eligible</th>
                    <th className="px-3 py-2 text-left font-semibold">Last Scheduled Sync</th>
                    <th className="px-3 py-2 text-left font-semibold">Failure Reason</th>
                    <th className="px-3 py-2 text-left font-semibold">Manual Action</th>
                    <th className="px-3 py-2 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                    <tr key={item.connectorKey} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{item.connectorKey}</div>
                        <div className="text-slate-600">{item.sourceName}</div>
                        <a className="text-blue-700 hover:underline" href={item.officialUrl} target="_blank" rel="noreferrer noopener">
                          Official URL
                        </a>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>{item.provider}</div>
                        <div>{item.municipality || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>{item.province || 'N/A'}</div>
                        <div>{item.district || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.sourceType}</td>
                      <td className="px-3 py-2 text-slate-700">{item.sourceStatus}</td>
                      <td className="px-3 py-2 text-slate-700">{item.legalMode}</td>
                      <td className="px-3 py-2 text-slate-700">{item.accessStatus}</td>
                      <td className="px-3 py-2 text-slate-700">{item.activationState}</td>
                      <td className="px-3 py-2 text-slate-700">{item.legalClassification}</td>
                      <td className="px-3 py-2 text-slate-700">{item.services.join(', ')}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>Status: {item.lastSync?.status || 'N/A'}</div>
                        <div>Time: {item.lastSync?.timestamp || 'N/A'}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.nextSync || 'N/A'}</td>
                      <td className="px-3 py-2 text-slate-700">{item.cron.eligible ? 'YES' : 'NO'}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>Status: {item.lastScheduledSync?.status || 'N/A'}</div>
                        <div>Time: {item.lastScheduledSync?.timestamp || 'N/A'}</div>
                        <div>Active: {item.scheduledSyncActive ? 'YES' : 'NO'}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{scheduleStateLabel(item)}</div>
                      </td>
                      <td className="px-3 py-2 text-rose-700">{item.failureReason || 'N/A'}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>{item.manualActionRequired ? 'REQUIRED' : 'NONE'}</div>
                        <div className="mt-1 text-[11px] text-slate-600">{guidanceMessage(item)}</div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          onClick={() => syncNow(item.connectorKey)}
                          disabled={syncingKey === item.connectorKey || !safeSyncEnabled(item)}
                        >
                          {syncingKey === item.connectorKey ? 'Syncing...' : 'Sync now'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
