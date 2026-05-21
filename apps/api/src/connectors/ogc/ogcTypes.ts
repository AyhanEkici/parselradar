export type OgcServiceType = 'WMS' | 'WMTS' | 'WFS';

export type OgcLayerRecord = {
  id: string;
  provider: string;
  service: OgcServiceType;
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

export type OgcCapabilitiesResult = {
  service: OgcServiceType;
  provider: string;
  endpoint: string;
  state: 'NOT_CONFIGURED' | 'READY' | 'FAILED';
  availability: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  available: boolean;
  latencyMs: number;
  parseState: 'PARSED' | 'FAILED' | 'SKIPPED';
  layerCount: number;
  projectionSupport: string[];
  formats: string[];
  layers: OgcLayerRecord[];
  errorCode?: string;
  message?: string;
  error?: string;
  action?: string;
  lastSync: string;
};

export type OgcProviderDiagnostics = {
  provider: string;
  services: OgcCapabilitiesResult[];
  layerCount: number;
  availability: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  lastSync: string;
};
