import { fetchOgcCapabilities } from '../ogc/ogcCapabilitiesClient';
import { OgcLayerRecord, OgcProviderDiagnostics } from '../ogc/ogcTypes';

type LayerVisibilityPatch = {
  visible?: boolean;
  opacity?: number;
};

const provider = 'tucbs_public_geo_layers';

let cachedLayers: OgcLayerRecord[] = [];
let cachedDiagnostics: OgcProviderDiagnostics | null = null;

const visibilityIndex = new Map<string, { visibility: boolean; opacity: number }>();

function pickAvailability(services: OgcProviderDiagnostics['services']): OgcProviderDiagnostics['availability'] {
  if (services.every((item) => !item.available)) return 'UNAVAILABLE';
  if (services.some((item) => !item.available || item.parseState !== 'PARSED')) return 'DEGRADED';
  return 'HEALTHY';
}

function applyVisibility(layer: OgcLayerRecord): OgcLayerRecord {
  const current = visibilityIndex.get(layer.id);
  if (!current) return layer;
  return {
    ...layer,
    visibility: current.visibility,
    opacity: current.opacity,
  };
}

export async function syncTucbsLayerCatalog() {
  const wmsEndpoint = String(process.env.CONNECTOR_TUCBS_WMS_ENDPOINT || '').trim();
  const wmtsEndpoint = String(process.env.CONNECTOR_TUCBS_WMTS_ENDPOINT || '').trim();
  const wfsEndpoint = String(process.env.CONNECTOR_TUCBS_WFS_ENDPOINT || '').trim();

  const [wms, wmts, wfs] = await Promise.all([
    fetchOgcCapabilities(provider, 'WMS', wmsEndpoint || undefined),
    fetchOgcCapabilities(provider, 'WMTS', wmtsEndpoint || undefined),
    fetchOgcCapabilities(provider, 'WFS', wfsEndpoint || undefined),
  ]);

  const merged = [...wms.layers, ...wmts.layers, ...wfs.layers].map(applyVisibility);
  cachedLayers = merged;
  cachedDiagnostics = {
    provider,
    services: [wms, wmts, wfs],
    layerCount: merged.length,
    availability: pickAvailability([wms, wmts, wfs]),
    lastSync: new Date().toISOString(),
  };

  return {
    provider,
    layers: cachedLayers,
    diagnostics: cachedDiagnostics,
  };
}

export async function getTucbsLayerCatalog() {
  if (!cachedDiagnostics) {
    await syncTucbsLayerCatalog();
  }
  return {
    provider,
    layers: cachedLayers,
    diagnostics: cachedDiagnostics,
  };
}

export async function patchLayerVisibility(layerId: string, patch: LayerVisibilityPatch) {
  const current = visibilityIndex.get(layerId) || { visibility: false, opacity: 1 };
  const next = {
    visibility: typeof patch.visible === 'boolean' ? patch.visible : current.visibility,
    opacity:
      typeof patch.opacity === 'number'
        ? Math.max(0, Math.min(1, patch.opacity))
        : current.opacity,
  };

  visibilityIndex.set(layerId, next);
  cachedLayers = cachedLayers.map((layer) => (layer.id === layerId ? { ...layer, visibility: next.visibility, opacity: next.opacity } : layer));

  return { layerId, ...next };
}

export async function getTucbsLayerHealth() {
  const catalog = await getTucbsLayerCatalog();
  return {
    provider,
    availability: catalog.diagnostics?.availability || 'UNAVAILABLE',
    lastSync: catalog.diagnostics?.lastSync || new Date().toISOString(),
    serviceDiagnostics: catalog.diagnostics?.services || [],
    layerCount: catalog.layers.length,
    projectionSupport: Array.from(new Set(catalog.layers.flatMap((layer) => layer.projection))).filter(Boolean),
  };
}
