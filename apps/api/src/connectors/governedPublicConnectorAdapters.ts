import axios from 'axios';
import { ConnectorKeyV26 } from '../services/connectors/connectorCapabilityMatrix';

export type GovernedFetchResult = {
  connectorKey: ConnectorKeyV26;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  source: string;
  timestamp: string;
  records: Array<Record<string, unknown>>;
  reason?: string;
};

function env(name: string) {
  return String(process.env[name] || '').trim();
}

function endpointFor(key: ConnectorKeyV26) {
  return env(`CONNECTOR_${key.toUpperCase()}_ENDPOINT`);
}

function tokenFor(key: ConnectorKeyV26) {
  return env(`CONNECTOR_${key.toUpperCase()}_TOKEN`);
}

function enabledForFetch(key: ConnectorKeyV26) {
  return env(`CONNECTOR_${key.toUpperCase()}_ALLOW_HTTP`).toLowerCase() === 'true';
}

export async function fetchGovernedConnectorMetadata(input: {
  connectorKey: ConnectorKeyV26;
  query: Record<string, string | number | boolean | undefined>;
}): Promise<GovernedFetchResult> {
  const timestamp = new Date().toISOString();
  const endpoint = endpointFor(input.connectorKey);
  const token = tokenFor(input.connectorKey);

  if (!endpoint) {
    return {
      connectorKey: input.connectorKey,
      status: 'SKIPPED',
      source: input.connectorKey,
      timestamp,
      records: [],
      reason: 'endpoint_not_configured',
    };
  }

  if (!enabledForFetch(input.connectorKey)) {
    return {
      connectorKey: input.connectorKey,
      status: 'SKIPPED',
      source: input.connectorKey,
      timestamp,
      records: [],
      reason: 'http_fetch_not_explicitly_enabled',
    };
  }

  try {
    const response = await axios.get(endpoint, {
      params: input.query,
      timeout: 5000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = response.data;
    const records = Array.isArray(data) ? data : (data as any)?.records && Array.isArray((data as any).records) ? (data as any).records : [];

    return {
      connectorKey: input.connectorKey,
      status: 'SUCCESS',
      source: input.connectorKey,
      timestamp,
      records: records
        .slice(0, 20)
        .map((item: unknown) => (typeof item === 'object' && item ? (item as Record<string, unknown>) : { value: item })),
    };
  } catch (error) {
    return {
      connectorKey: input.connectorKey,
      status: 'FAILED',
      source: input.connectorKey,
      timestamp,
      records: [],
      reason: `fetch_failed:${error instanceof Error ? error.message : 'unknown'}`,
    };
  }
}
