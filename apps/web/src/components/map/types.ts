export type GeoLayerRecord = {
  id: string;
  provider: string;
  service: 'WMS' | 'WMTS' | 'WFS';
  name: string;
  title: string;
  projection: string[];
  bbox?: {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
    crs?: string;
  };
  format: string[];
  styles: string[];
  visibility: boolean;
  opacity: number;
  healthState: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  readOnly: true;
};

export type GeoServiceDiagnostics = {
  service: 'WMS' | 'WMTS' | 'WFS';
  provider: string;
  endpoint: string;
  available: boolean;
  latencyMs: number;
  parseState: 'PARSED' | 'FAILED' | 'SKIPPED';
  layerCount: number;
  projectionSupport: string[];
  formats: string[];
  lastSync: string;
  error?: string;
};

export type GeoOverlayItem = {
  id: string;
  overlayType:
    | 'parcel_analysis'
    | 'municipality'
    | 'zoning'
    | 'infrastructure'
    | 'transport'
    | 'environmental'
    | 'investment'
    | 'organization';
  label: string;
  lat?: number;
  lng?: number;
  layerId?: string;
  analysisId?: string;
  propertyId?: string;
  portfolioId?: string;
  organizationId?: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export type MapViewport = {
  centerLat: number;
  centerLng: number;
  zoom: number;
};

export type MapRenderDiagnostics = {
  overlayRenderLatencyMs: number;
  tileFailures: number;
  timeoutLayers: string[];
  emptyLayerResponses: string[];
  crsMismatches: string[];
  unsupportedProjectionLayers: string[];
  unavailableProviders: string[];
  failedLayerLoads: string[];
  successfulTileRequests: number;
};
