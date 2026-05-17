import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ConnectorStatusCard from '../components/connectors/ConnectorStatusCard';
import ConnectorAuditTrailCard from '../components/connectors/ConnectorAuditTrailCard';

const STATE_ORDER = ['ACTIVE', 'TEST_PASSED', 'READY_FOR_TEST', 'TEST_FAILED', 'LEGAL_REVIEW_REQUIRED', 'CREDENTIALS_MISSING', 'NOT_CONFIGURED', 'DISABLED'];

export default function AdminConnectors() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([apiFetch('/admin/connectors'), apiFetch('/admin/connectors/audit-trail')])
      .then(([connectorData, auditData]) => {
        setData(connectorData);
        setAudit(auditData);
        setError('');
      })
      .catch((err) => setError(err?.error || err?.message || 'Connector data could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  const connectors: any[] = (data?.connectors || []).slice().sort((a: any, b: any) => {
    const ai = STATE_ORDER.indexOf(a.state);
    const bi = STATE_ORDER.indexOf(b.state);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const active = connectors.filter((c) => c.state === 'ACTIVE').length;
  const testPassed = connectors.filter((c) => c.state === 'TEST_PASSED').length;
  const readyForTest = connectors.filter((c) => c.state === 'READY_FOR_TEST').length;
  const failed = connectors.filter((c) =>
    ['NOT_CONFIGURED', 'CREDENTIALS_MISSING', 'LEGAL_REVIEW_REQUIRED', 'TEST_FAILED', 'DISABLED'].includes(c.state),
  ).length;

  return (
    <AdminLayout title="Connector Activation Readiness">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Live Connector Activation"
            subtitle="Connectors are activated one at a time. No source is marked ACTIVE without credentials, legal approval, and a passed test run."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yukleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {connectors.map((connector: any) => (
                      <Link key={connector.key} to={`/admin/connectors/${connector.key}`}>
                        <ConnectorStatusCard connector={connector} />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="xl:col-span-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 space-y-2">
                    <div className="font-semibold text-slate-800 mb-1">Summary</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Total</span>
                      <span className="text-xs font-semibold">{data?.summary?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">Active</span>
                      <span className="text-xs font-semibold text-emerald-700">{active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-700">Test Passed</span>
                      <span className="text-xs font-semibold text-blue-700">{testPassed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Ready for Test</span>
                      <span className="text-xs font-semibold">{readyForTest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-700">Blocked/Failed</span>
                      <span className="text-xs font-semibold text-amber-700">{failed}</span>
                    </div>
                  </div>
                </div>
              </div>

              <ConnectorAuditTrailCard audit={audit} />
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
