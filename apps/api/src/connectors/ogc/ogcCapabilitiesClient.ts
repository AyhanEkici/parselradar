import axios from 'axios';
import { OgcCapabilitiesResult, OgcServiceType } from './ogcTypes';
import { parseWfsCapabilities, parseWmsCapabilities, parseWmtsCapabilities } from './capabilitiesParser';

function normalizeEndpoint(endpoint: string) {
  return String(endpoint || '').trim().replace(/\?+$/, '');
}

function buildCapabilitiesUrl(endpoint: string, service: OgcServiceType) {
  const base = normalizeEndpoint(endpoint);
  const delimiter = base.includes('?') ? '&' : '?';
  return `${base}${delimiter}request=GetCapabilities&service=${service}`;
}

export async function fetchOgcCapabilities(provider: string, service: OgcServiceType, endpoint?: string): Promise<OgcCapabilitiesResult> {
  const lastSync = new Date().toISOString();
  if (!endpoint) {
    return {
      service,
      provider,
      endpoint: '',
      available: false,
      latencyMs: 0,
      parseState: 'SKIPPED',
      layerCount: 0,
      projectionSupport: [],
      formats: [],
      layers: [],
      error: `Missing ${service} endpoint`,
      lastSync,
    };
  }

  const url = buildCapabilitiesUrl(endpoint, service);
  const start = Date.now();

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'text',
      validateStatus: (code) => code >= 200 && code < 500,
    });

    const latencyMs = Date.now() - start;
    if (response.status !== 200) {
      return {
        service,
        provider,
        endpoint,
        available: false,
        latencyMs,
        parseState: 'FAILED',
        layerCount: 0,
        projectionSupport: [],
        formats: [],
        layers: [],
        error: `GetCapabilities returned ${response.status}`,
        lastSync,
      };
    }

    const xml = String(response.data || '');
    const parsed =
      service === 'WMS'
        ? parseWmsCapabilities(xml, provider)
        : service === 'WMTS'
          ? parseWmtsCapabilities(xml, provider)
          : parseWfsCapabilities(xml, provider);

    return {
      service,
      provider,
      endpoint,
      available: true,
      latencyMs,
      parseState: 'PARSED',
      layerCount: parsed.layers.length,
      projectionSupport: parsed.projections,
      formats: parsed.formats,
      layers: parsed.layers,
      lastSync,
    };
  } catch (err: any) {
    return {
      service,
      provider,
      endpoint,
      available: false,
      latencyMs: Date.now() - start,
      parseState: 'FAILED',
      layerCount: 0,
      projectionSupport: [],
      formats: [],
      layers: [],
      error: err?.message || 'Capabilities request failed',
      lastSync,
    };
  }
}
