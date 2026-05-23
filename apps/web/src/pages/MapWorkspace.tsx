import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import ActiveLayerToolbar from '../components/map/ActiveLayerToolbar';
import GeoAnalysisOverlay from '../components/map/GeoAnalysisOverlay';
import LayerGroupPanel from '../components/map/LayerGroupPanel';
import LayerLegend from '../components/map/LayerLegend';
import MapDiagnosticsPanel from '../components/map/MapDiagnosticsPanel';
import SpatialAnalysisPanel from '../components/map/SpatialAnalysisPanel';
import { clearViewport, loadViewport, saveViewport, viewportDefaults } from '../components/map/ViewportPersistence';
import { GeoLayerRecord, GeoOverlayItem, GeoServiceDiagnostics, MapRenderDiagnostics, MapViewport } from '../components/map/types';

const LAYER_STATE_KEY = 'geo_map_layer_state_v1';

type Mode = 'workspace' | 'analysis' | 'portfolio';

function parseNumber(value: unknown): number | undefined {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function loadLayerState(): Record<string, { visibility: boolean; opacity: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LAYER_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, { visibility: boolean; opacity: number }>;
    return parsed || {};
  } catch {
    return {};
  }
}

function saveLayerState(map: Record<string, { visibility: boolean; opacity: number }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAYER_STATE_KEY, JSON.stringify(map));
}

function classifyLayerOverlayType(layer: GeoLayerRecord): GeoOverlayItem['overlayType'] {
  const text = `${layer.title} ${layer.name}`.toLowerCase();
  if (/belediye|municipal|district|mahalle|ilce/.test(text)) return 'municipality';
  if (/zon|plan|imar|landuse/.test(text)) return 'zoning';
  if (/transport|road|rail|metro|highway/.test(text)) return 'transport';
  if (/env|forest|pollution|climate|eco/.test(text)) return 'environmental';
  if (/market|investment|opportunity|value/.test(text)) return 'investment';
  return 'infrastructure';
}

export default function MapWorkspace({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const [layers, setLayers] = useState<GeoLayerRecord[]>([]);
  const [serviceDiagnostics, setServiceDiagnostics] = useState<GeoServiceDiagnostics[]>([]);
  const [overlays, setOverlays] = useState<GeoOverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [viewport, setViewport] = useState<MapViewport>(viewportDefaults);
  const [diagnostics, setDiagnostics] = useState<MapRenderDiagnostics>({
    overlayRenderLatencyMs: 0,
    tileFailures: 0,
    timeoutLayers: [],
    emptyLayerResponses: [],
    crsMismatches: [],
    unsupportedProjectionLayers: [],
    unavailableProviders: [],
    failedLayerLoads: [],
    successfulTileRequests: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setViewport(loadViewport(mode, user.id));
  }, [mode, user]);

  useEffect(() => {
    if (!user) return;
    saveViewport(mode, user.id, viewport);
  }, [mode, user, viewport]);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const [layerPayload, diagnosticsPayload, propertiesPayload, reportsPayload, organizationsPayload, portfoliosPayload] = await Promise.all([
          apiFetch('/geo/layers'),
          apiFetch('/geo/diagnostics'),
          apiFetch('/properties'),
          apiFetch('/reports'),
          apiFetch('/organizations'),
          apiFetch('/investor/portfolio').catch(() => []),
        ]);

        const layerRows = Array.isArray(layerPayload?.layers) ? (layerPayload.layers as GeoLayerRecord[]) : [];
        const localState = loadLayerState();

        const hydratedLayers = layerRows.map((layer) => {
          const state = localState[layer.id];
          if (!state) return layer;
          return {
            ...layer,
            visibility: state.visibility,
            opacity: state.opacity,
          };
        });

        setLayers(hydratedLayers);

        const services = Array.isArray(diagnosticsPayload?.serviceDiagnostics)
          ? (diagnosticsPayload.serviceDiagnostics as GeoServiceDiagnostics[])
          : [];
        setServiceDiagnostics(services);

        const properties = Array.isArray(propertiesPayload) ? propertiesPayload : [];
        const reports = Array.isArray(reportsPayload) ? reportsPayload : [];
        const organizations = Array.isArray(organizationsPayload?.organizations) ? organizationsPayload.organizations : [];
        const portfolios = Array.isArray(portfoliosPayload) ? portfoliosPayload : [];

        const reportByProperty = new Map<string, any>();
        for (const report of reports) {
          if (report?.propertySubmissionId) {
            reportByProperty.set(String(report.propertySubmissionId), report);
          }
        }

        const parcelOverlays: GeoOverlayItem[] = properties
          .filter((property: any) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude))
          .map((property: any) => {
            const linkedReport = reportByProperty.get(String(property._id));
            return {
              id: `parcel-${property._id}`,
              overlayType: 'parcel_analysis',
              label: `${property.il || ''} ${property.ilce || ''} ${property.mahalleOrKoy || ''}`.trim() || String(property._id),
              lat: Number(property.latitude),
              lng: Number(property.longitude),
              propertyId: String(property._id),
              analysisId: linkedReport?.analysisRunId ? String(linkedReport.analysisRunId) : undefined,
              score: parseNumber(property.opportunityScore),
              metadata: {
                askingPriceTRY: property.askingPriceTRY,
                areaM2: property.areaM2,
                zoningStatus: property.zoningStatus,
              },
            };
          });

        const layerOverlays: GeoOverlayItem[] = hydratedLayers.map((layer) => ({
          id: `layer-${layer.id}`,
          overlayType: classifyLayerOverlayType(layer),
          label: layer.title,
          layerId: layer.id,
          metadata: {
            service: layer.service,
            projection: layer.projection,
            healthState: layer.healthState,
          },
        }));

        const portfolioDetails = await Promise.all(
          portfolios.slice(0, 6).map((portfolio: any) => apiFetch(`/investor/portfolio/${portfolio._id}`).catch(() => null))
        );

        const investmentOverlays: GeoOverlayItem[] = [];
        for (const detail of portfolioDetails) {
          if (!detail?.portfolio || !Array.isArray(detail?.items)) continue;
          for (const item of detail.items) {
            const property = item?.property;
            if (!Number.isFinite(property?.latitude) || !Number.isFinite(property?.longitude)) continue;
            investmentOverlays.push({
              id: `investment-${detail.portfolio._id}-${item._id}`,
              overlayType: 'investment',
              label: `${detail.portfolio.name}: ${property.ilce || property.il || 'asset'}`,
              lat: Number(property.latitude),
              lng: Number(property.longitude),
              propertyId: String(property._id),
              portfolioId: String(detail.portfolio._id),
              score: parseNumber(item?.latestAnalysis?.opportunityScore),
              metadata: {
                allocationWeight: item?.allocationWeight,
                thesis: item?.thesis,
              },
            });
          }
        }

        const organizationOverlays: GeoOverlayItem[] = [];
        for (const org of organizations.slice(0, 8)) {
          const detail = await apiFetch(`/organizations/${org._id}`).catch(() => null);
          const rows = Array.isArray(detail?.spatialPortfolio) ? detail.spatialPortfolio : [];
          for (const row of rows) {
            if (!Number.isFinite(row?.latitude) || !Number.isFinite(row?.longitude)) continue;
            organizationOverlays.push({
              id: `org-${org._id}-${row.propertyId}`,
              overlayType: 'organization',
              label: `${org.name}: ${row.ilce || row.il || 'project'}`,
              lat: Number(row.latitude),
              lng: Number(row.longitude),
              organizationId: String(org._id),
              propertyId: String(row.propertyId),
              metadata: {
                opportunityScore: row.opportunityScore,
                askingPriceTRY: row.askingPriceTRY,
              },
            });
          }
        }

        let mergedOverlays = [...layerOverlays, ...parcelOverlays, ...investmentOverlays, ...organizationOverlays];

        if (mode === 'analysis' && params.id) {
          mergedOverlays = mergedOverlays.filter((overlay) => {
            if (overlay.overlayType !== 'parcel_analysis') return true;
            return overlay.analysisId === String(params.id);
          });
        }

        if (mode === 'portfolio') {
          mergedOverlays = mergedOverlays.filter(
            (overlay) =>
              overlay.overlayType === 'investment' ||
              overlay.overlayType === 'infrastructure' ||
              overlay.overlayType === 'transport' ||
              overlay.overlayType === 'environmental' ||
              overlay.overlayType === 'zoning' ||
              overlay.overlayType === 'municipality'
          );
        }

        setOverlays(mergedOverlays);

        if (mode === 'analysis' && params.id) {
          const active = mergedOverlays.find((overlay) => overlay.analysisId === String(params.id));
          if (active?.id) {
            setSelectedOverlayId(active.id);
            if (Number.isFinite(active.lat) && Number.isFinite(active.lng)) {
              setViewport((current) => ({ ...current, centerLat: Number(active.lat), centerLng: Number(active.lng), zoom: Math.max(1.8, current.zoom) }));
            }
          }
        }
      } catch (err: any) {
        setError(err?.error || err?.message || 'Geo workspace could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [mode, params.id, user]);

  const visibleOverlays = useMemo(() => {
    const visibleLayerIds = new Set(layers.filter((layer) => layer.visibility).map((layer) => layer.id));

    return overlays.filter((overlay) => {
      if (overlay.layerId) return visibleLayerIds.has(overlay.layerId);
      if (overlay.overlayType === 'parcel_analysis') return true;
      if (overlay.overlayType === 'investment') return true;
      if (overlay.overlayType === 'organization') return true;
      return true;
    });
  }, [layers, overlays]);

  const selectedOverlayLabel = useMemo(() => {
    return visibleOverlays.find((overlay) => overlay.id === selectedOverlayId)?.label;
  }, [selectedOverlayId, visibleOverlays]);

  const onToggleLayer = (layerId: string, nextVisible: boolean) => {
    setLayers((current) => {
      const next = current.map((layer) => (layer.id === layerId ? { ...layer, visibility: nextVisible } : layer));
      const index = next.reduce<Record<string, { visibility: boolean; opacity: number }>>((acc, layer) => {
        acc[layer.id] = { visibility: layer.visibility, opacity: layer.opacity };
        return acc;
      }, {});
      saveLayerState(index);
      return next;
    });
  };

  const onOpacityLayer = (layerId: string, opacity: number) => {
    setLayers((current) => {
      const next = current.map((layer) => (layer.id === layerId ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer));
      const index = next.reduce<Record<string, { visibility: boolean; opacity: number }>>((acc, layer) => {
        acc[layer.id] = { visibility: layer.visibility, opacity: layer.opacity };
        return acc;
      }, {});
      saveLayerState(index);
      return next;
    });
  };

  const resetViewport = () => {
    if (!user) return;
    clearViewport(mode, user.id);
    setViewport(viewportDefaults);
  };

  if (!user) return <div className="p-6">Oturum gerekli</div>;

  const modeLabel = mode === 'portfolio' ? 'Geo Workspace Preview - Portfolio' : 'Geo Workspace Preview';

  return (
    <div className="premium-map min-h-screen p-4">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{modeLabel}</h1>
          <div className="flex gap-2 text-xs">
            <button className="premium-outline rounded px-3 py-1" onClick={() => navigate('/map')}>map</button>
            <button className="premium-outline rounded px-3 py-1" onClick={() => navigate('/map/portfolio')}>portfolio</button>
          </div>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Internal beta preview only. No configured layers yet. This workspace is informational and does not provide official GIS, municipality, zoning, TKGM, TUCBS, or CSB proof.
        </div>

        <ActiveLayerToolbar
          search={search}
          onSearch={setSearch}
          selectedOverlayLabel={selectedOverlayLabel}
          compareMode={compareMode}
          onCompareMode={setCompareMode}
          onResetViewport={resetViewport}
        />

        {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        {loading ? <div className="text-sm text-slate-600">Geo overlays loading...</div> : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-3">
            <LayerGroupPanel layers={layers} search={search} onToggle={onToggleLayer} onOpacity={onOpacityLayer} />
            <LayerLegend overlays={visibleOverlays} />
          </div>

          <div className="xl:col-span-6">
            <GeoAnalysisOverlay
              viewport={viewport}
              layers={layers}
              overlays={visibleOverlays}
              selectedOverlayId={selectedOverlayId}
              compareMode={compareMode}
              serviceDiagnostics={serviceDiagnostics}
              onSelectOverlay={setSelectedOverlayId}
              onViewportChange={setViewport}
              onDiagnostics={setDiagnostics}
            />
          </div>

          <div className="space-y-4 xl:col-span-3">
            <SpatialAnalysisPanel overlays={visibleOverlays} selectedOverlayId={selectedOverlayId} onSelectOverlay={setSelectedOverlayId} />
            <MapDiagnosticsPanel diagnostics={diagnostics} />
          </div>
        </div>
      </div>
    </div>
  );
}
