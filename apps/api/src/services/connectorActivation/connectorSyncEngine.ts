import ConnectorSyncRun from '../../models/ConnectorSyncRun';
import {
  CONNECTOR_SOURCE_REGISTRY,
  findConnectorSourceRegistry,
} from '../../config/connectors/sourceRegistryCatalog';
import { syncTucbsLayerCatalog } from '../../connectors/tucbs/tucbsLayerCatalog';

type SyncTriggerMode = 'MANUAL' | 'SCHEDULED';

function buildNextSyncAt(cronCadenceMinutes?: number, lastFinishedAt?: Date) {
  if (!cronCadenceMinutes || !lastFinishedAt) return null;
  return new Date(lastFinishedAt.getTime() + cronCadenceMinutes * 60 * 1000).toISOString();
}

export async function runConnectorSyncNow(connectorKey: string, userId?: string, triggerMode: SyncTriggerMode = 'MANUAL') {
  const registry = findConnectorSourceRegistry(connectorKey);
  const startedAt = new Date();

  if (!registry) {
    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: 'Unknown source',
      sourceUrl: '',
      triggerMode,
      status: 'SKIPPED',
      startedAt,
      finishedAt,
      error: 'Source registry entry is missing for connector.',
      runByUserId: userId,
      responseSummary: { reason: 'MISSING_SOURCE_REGISTRY_ENTRY' },
    });
  }

  if (registry.syncSafety !== 'SAFE_PUBLIC_METADATA') {
    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: registry.sourceName,
      sourceUrl: registry.officialUrl,
      triggerMode,
      status: 'BLOCKED',
      startedAt,
      finishedAt,
      error: registry.blockedReason || 'Automation blocked by connector policy.',
      runByUserId: userId,
      responseSummary: {
        syncSafety: registry.syncSafety,
        services: registry.services,
      },
    });
  }

  try {
    let responseSummary: Record<string, unknown> = {
      mode: 'SAFE_PUBLIC_METADATA',
      services: registry.services,
    };

    if (connectorKey === 'tucbs_ogc') {
      const result = await syncTucbsLayerCatalog();
      responseSummary = {
        ...responseSummary,
        provider: result.provider,
        layerCount: result.layers.length,
        availability: result.diagnostics?.availability,
        diagnosticsServices: result.diagnostics?.services?.map((service) => ({
          service: service.service,
          available: service.available,
          parseState: service.parseState,
          latencyMs: service.latencyMs,
        })),
      };
    }

    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: registry.sourceName,
      sourceUrl: registry.officialUrl,
      triggerMode,
      status: 'SUCCESS',
      startedAt,
      finishedAt,
      runByUserId: userId,
      responseSummary,
    });
  } catch (error: any) {
    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: registry.sourceName,
      sourceUrl: registry.officialUrl,
      triggerMode,
      status: 'FAILED',
      startedAt,
      finishedAt,
      runByUserId: userId,
      error: String(error?.message || error || 'Unknown sync failure'),
      responseSummary: {
        mode: 'SAFE_PUBLIC_METADATA',
        services: registry.services,
      },
    });
  }
}

export async function buildAdminConnectorCenter() {
  const runs = await ConnectorSyncRun.find({
    connectorKey: { $in: CONNECTOR_SOURCE_REGISTRY.map((entry) => entry.connectorKey) },
  })
    .sort({ finishedAt: -1 })
    .limit(200)
    .lean();

  const latestByConnector = new Map<string, any>();
  for (const run of runs) {
    if (!latestByConnector.has(run.connectorKey)) {
      latestByConnector.set(run.connectorKey, run);
    }
  }

  const items = CONNECTOR_SOURCE_REGISTRY.map((entry) => {
    const latest = latestByConnector.get(entry.connectorKey);
    const lastSyncAt = latest?.finishedAt ? new Date(latest.finishedAt).toISOString() : null;
    const nextSyncAt = entry.cronEligible ? buildNextSyncAt(entry.cronCadenceMinutes, latest?.finishedAt) : null;
    return {
      connectorKey: entry.connectorKey,
      sourceName: entry.sourceName,
      officialUrl: entry.officialUrl,
      sourceStatus: entry.status,
      legalClassification: entry.legalClassification,
      services: entry.services,
      syncSafety: entry.syncSafety,
      lastSync: latest
        ? {
            status: latest.status,
            timestamp: lastSyncAt,
            error: latest.error || null,
            responseSummary: latest.responseSummary || null,
            source: latest.sourceName,
          }
        : null,
      nextSync: nextSyncAt,
      failureReason: latest?.status === 'FAILED' || latest?.status === 'BLOCKED' ? latest.error || null : null,
      manualActionRequired: entry.manualActionRequired,
      cron: {
        eligible: entry.cronEligible,
        cadenceMinutes: entry.cronCadenceMinutes || null,
      },
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    items,
  };
}
