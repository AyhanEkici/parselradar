import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ReadOnlyLayerTogglePanel from '../components/map/ReadOnlyLayerTogglePanel';
import ReadOnlyLayerOverlayMap from '../components/map/ReadOnlyLayerOverlayMap';

export default function AdminLayers() {
  const { user } = useAuth();
  const [layers, setLayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/layers');
      setLayers(Array.isArray(payload?.layers) ? payload.layers : []);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Layer catalog could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (layerId: string, visibility: boolean) => {
    try {
      await apiFetch(`/admin/layers/${encodeURIComponent(layerId)}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visible: visibility }),
      });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'Layer visibility update failed');
    }
  };

  const setOpacity = async (layerId: string, opacity: number) => {
    try {
      await apiFetch(`/admin/layers/${encodeURIComponent(layerId)}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ opacity }),
      });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'Layer opacity update failed');
    }
  };

  const readOnlyViolations = useMemo(() => {
    return layers.filter((layer) => layer.readOnly !== true);
  }, [layers]);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="Layer Catalog">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Layer Catalog" subtitle="Read-only geo overlay catalog with visibility and opacity controls." />
          {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {readOnlyViolations.length > 0 ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Read-only violation detected in layer catalog.</div>
          ) : null}
          {!loading ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <ReadOnlyLayerTogglePanel layers={layers} onToggle={toggle} onOpacity={setOpacity} />
              </div>
              <div className="xl:col-span-6">
                <ReadOnlyLayerOverlayMap layers={layers} />
              </div>
            </div>
          ) : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
