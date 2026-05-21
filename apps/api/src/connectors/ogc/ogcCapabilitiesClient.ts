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

  const missingEndpointCodes: Record<OgcServiceType, string> = {
    WMS: 'MISSING_WMS_ENDPOINT',
    WMTS: 'MISSING_WMTS_ENDPOINT',
    WFS: 'MISSING_WFS_ENDPOINT',
  };

  const missingEndpointMessages: Record<OgcServiceType, string> = {
    WMS: 'WMS endpoint is not configured.',
    WMTS: 'WMTS endpoint is not configured.',
    WFS: 'WFS endpoint is not configured.',
  };

  const missingEndpointActions: Record<OgcServiceType, string> = {
    WMS: 'Set CONNECTOR_TUCBS_WMS_ENDPOINT to enable WMS capability diagnostics.',
    WMTS: 'Set CONNECTOR_TUCBS_WMTS_ENDPOINT to enable WMTS capability diagnostics.',
    WFS: 'Set CONNECTOR_TUCBS_WFS_ENDPOINT to enable WFS capability diagnostics.',
  };

  if (!endpoint) {
    return {
      service,
      provider,
      endpoint: '',
      state: 'NOT_CONFIGURED',
      availability: 'UNAVAILABLE',
      available: false,
      latencyMs: 0,
      parseState: 'SKIPPED',
      layerCount: 0,
      projectionSupport: [],
      formats: [],
      layers: [],
      errorCode: missingEndpointCodes[service],
      message: missingEndpointMessages[service],
      error: missingEndpointMessages[service],
      action: missingEndpointActions[service],
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
        state: 'FAILED',
        availability: 'UNAVAILABLE',
        available: false,
        latencyMs,
        parseState: 'FAILED',
        layerCount: 0,
        projectionSupport: [],
        formats: [],
        layers: [],
        message: `GetCapabilities returned ${response.status}`,
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
      state: 'READY',
      availability: 'HEALTHY',
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
      state: 'FAILED',
      availability: 'UNAVAILABLE',
      available: false,
      latencyMs: Date.now() - start,
      parseState: 'FAILED',
      layerCount: 0,
      projectionSupport: [],
      formats: [],
      layers: [],
      message: err?.message || 'Capabilities request failed',
      error: err?.message || 'Capabilities request failed',
      lastSync,
    };
  }
}
