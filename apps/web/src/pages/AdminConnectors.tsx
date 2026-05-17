import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ConnectorStatusCard from '../components/connectors/ConnectorStatusCard';
import ConnectorAuditTrailCard from '../components/connectors/ConnectorAuditTrailCard';

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

  return (
    <AdminLayout title="Connector Activation Readiness">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Real Connector Activation"
            subtitle="Connector status is explicit. No live external source is implied without credentials, legal approval, and test pass."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yukleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(data?.connectors || []).map((connector: any) => (
                      <Link key={connector.key} to={`/admin/connectors/${connector.key}`}>
                        <ConnectorStatusCard connector={connector} />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <div>Total connectors: {data?.summary?.total || 0}</div>
                    <div>Active: {data?.summary?.active || 0}</div>
                    <div>Ready for test: {data?.summary?.readyForTest || 0}</div>
                    <div>Failed/Missing: {data?.summary?.failedOrMissing || 0}</div>
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
