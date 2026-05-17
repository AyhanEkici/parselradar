import React, { useEffect, useState } from 'react';

interface AuditEntry {
  id?: string;
  state: string;
  message?: string;
  checkedAt?: string | Date;
  activatedAt?: string | Date;
  deactivatedAt?: string | Date;
  runByUserId?: string;
  activatedByUserId?: string;
  deactivatedByUserId?: string;
  createdAt?: string | Date;
}

interface ConnectorActivationAuditPanelProps {
  connectorKey: string;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
}

export default function ConnectorActivationAuditPanel({
  connectorKey,
  apiFetch,
}: ConnectorActivationAuditPanelProps) {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/connectors/${connectorKey}/audit`);
      setAudit(data);
    } catch {
      // silent fail — audit is supplementary
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [connectorKey]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Activation Audit Trail</div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-slate-800 underline disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">Loading...</p>}

      {!loading && audit && (
        <div className="space-y-4">
          {audit.testRuns?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Test Runs</div>
              <div className="space-y-1">
                {(audit.testRuns as AuditEntry[]).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-semibold ${
                        r.state === 'TEST_PASSED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.state}
                    </span>
                    <span className="text-slate-600 truncate">{r.message}</span>
                    <span className="ml-auto text-slate-400 shrink-0">
                      {r.checkedAt ? new Date(r.checkedAt).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {audit.activationRecords?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Activation Events</div>
              <div className="space-y-1">
                {(audit.activationRecords as AuditEntry[]).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-semibold ${
                        r.state === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.state}
                    </span>
                    <span className="text-slate-400 ml-auto shrink-0">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!audit.testRuns?.length && !audit.activationRecords?.length && (
            <p className="text-xs text-slate-400">No audit records yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
