import ConnectorSyncRun from '../../models/ConnectorSyncRun';
import {
  CONNECTOR_SOURCE_REGISTRY,
  findConnectorSourceRegistry,
} from '../../config/connectors/sourceRegistryCatalog';
import { syncTucbsLayerCatalog } from '../../connectors/tucbs/tucbsLayerCatalog';

type SyncTriggerMode = 'MANUAL' | 'SCHEDULED';

type ScheduledSyncSkipReason =
  | 'SKIPPED_MANUAL_GUIDANCE'
  | 'SKIPPED_PERMISSION_REQUIRED'
  | 'SKIPPED_CRON_INELIGIBLE'
  | 'SKIPPED_NOT_PUBLIC_METADATA_SYNC'
  | 'SKIPPED_UNSAFE_SYNC_POLICY'
  | 'SKIPPED_INACTIVE_CONNECTOR';

function isBlockedOrPermissionedAccessStatus(accessStatus?: string) {
  const normalized = String(accessStatus || '').toUpperCase();
  return (
    normalized.includes('BLOCKED') ||
    normalized.includes('PERMISSION') ||
    normalized.includes('EDEVLET') ||
    normalized.includes('LOGIN') ||
    normalized.includes('CAPTCHA')
  );
}

function canRunScheduledMetadataSync(entry: (typeof CONNECTOR_SOURCE_REGISTRY)[number]) {
  if (!entry.cronEligible) {
    return { allowed: false, reason: 'SKIPPED_CRON_INELIGIBLE' as ScheduledSyncSkipReason };
  }

  if (entry.legalMode !== 'PUBLIC_METADATA_SYNC') {
    return { allowed: false, reason: 'SKIPPED_NOT_PUBLIC_METADATA_SYNC' as ScheduledSyncSkipReason };
  }

  if (entry.activationState !== 'ACTIVE') {
    return { allowed: false, reason: 'SKIPPED_INACTIVE_CONNECTOR' as ScheduledSyncSkipReason };
  }

  if (entry.syncSafety !== 'SAFE_PUBLIC_METADATA') {
    return { allowed: false, reason: 'SKIPPED_UNSAFE_SYNC_POLICY' as ScheduledSyncSkipReason };
  }

  if (entry.manualActionRequired) {
    return { allowed: false, reason: 'SKIPPED_MANUAL_GUIDANCE' as ScheduledSyncSkipReason };
  }

  if (isBlockedOrPermissionedAccessStatus(entry.accessStatus)) {
    return { allowed: false, reason: 'SKIPPED_PERMISSION_REQUIRED' as ScheduledSyncSkipReason };
  }

  return { allowed: true as const };
}

async function createScheduledPolicySkip(
  entry: (typeof CONNECTOR_SOURCE_REGISTRY)[number],
  reason: ScheduledSyncSkipReason,
  userId?: string,
) {
  const startedAt = new Date();
  const finishedAt = new Date();
  const reasonMessages: Record<ScheduledSyncSkipReason, string> = {
    SKIPPED_MANUAL_GUIDANCE: 'Manual public source guidance only. Scheduled sync skipped.',
    SKIPPED_PERMISSION_REQUIRED: 'Blocked/login/CAPTCHA/e-Devlet/permissioned source. Scheduled sync skipped.',
    SKIPPED_CRON_INELIGIBLE: 'Source is not cron eligible. Scheduled sync skipped.',
    SKIPPED_NOT_PUBLIC_METADATA_SYNC: 'Source legal mode is not PUBLIC_METADATA_SYNC. Scheduled sync skipped.',
    SKIPPED_UNSAFE_SYNC_POLICY: 'Source sync safety is not SAFE_PUBLIC_METADATA. Scheduled sync skipped.',
    SKIPPED_INACTIVE_CONNECTOR: 'Connector activation state is not ACTIVE. Scheduled sync skipped.',
  };

  return ConnectorSyncRun.create({
    connectorKey: entry.connectorKey,
    sourceName: entry.sourceName,
    sourceUrl: entry.officialUrl,
    triggerMode: 'SCHEDULED',
    status: 'SKIPPED',
    startedAt,
    finishedAt,
    runByUserId: userId,
    error: reasonMessages[reason],
    responseSummary: {
      reason,
      legalMode: entry.legalMode,
      accessStatus: entry.accessStatus,
      activationState: entry.activationState,
      syncSafety: entry.syncSafety,
      noPropertyLevelVerification: true,
    },
  });
}

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

  if (registry.manualActionRequired && registry.legalMode === 'MANUAL_GUIDANCE') {
    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: registry.sourceName,
      sourceUrl: registry.officialUrl,
      triggerMode,
      status: 'SKIPPED',
      startedAt,
      finishedAt,
      runByUserId: userId,
      error: 'Manual public source guidance only. Sync skipped by policy.',
      responseSummary: {
        reason: 'SKIPPED_MANUAL_GUIDANCE',
        legalMode: registry.legalMode,
        accessStatus: registry.accessStatus,
      },
    });
  }

  if (registry.legalMode === 'BLOCKED') {
    const finishedAt = new Date();
    return ConnectorSyncRun.create({
      connectorKey,
      sourceName: registry.sourceName,
      sourceUrl: registry.officialUrl,
      triggerMode,
      status: 'SKIPPED',
      startedAt,
      finishedAt,
      runByUserId: userId,
      error: registry.blockedReason || 'Blocked source requires login/CAPTCHA/e-Devlet access.',
      responseSummary: {
        reason: 'SKIPPED_PERMISSION_REQUIRED',
        legalMode: registry.legalMode,
        accessStatus: registry.accessStatus,
      },
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
  const latestScheduledByConnector = new Map<string, any>();
  for (const run of runs) {
    if (!latestByConnector.has(run.connectorKey)) {
      latestByConnector.set(run.connectorKey, run);
    }
    if (run.triggerMode === 'SCHEDULED' && !latestScheduledByConnector.has(run.connectorKey)) {
      latestScheduledByConnector.set(run.connectorKey, run);
    }
  }

  const items = CONNECTOR_SOURCE_REGISTRY.map((entry) => {
    const latest = latestByConnector.get(entry.connectorKey);
    const latestScheduled = latestScheduledByConnector.get(entry.connectorKey);
    const lastSyncAt = latest?.finishedAt ? new Date(latest.finishedAt).toISOString() : null;
    const lastScheduledSyncAt = latestScheduled?.finishedAt ? new Date(latestScheduled.finishedAt).toISOString() : null;
    const nextSyncAt = entry.cronEligible ? buildNextSyncAt(entry.cronCadenceMinutes, latest?.finishedAt) : null;
    return {
      connectorKey: entry.connectorKey,
      sourceName: entry.sourceName,
      officialUrl: entry.officialUrl,
      provider: entry.provider,
      municipality: entry.municipality || null,
      province: entry.province || null,
      district: entry.district || null,
      sourceType: entry.sourceType,
      sourceStatus: entry.status,
      legalMode: entry.legalMode,
      accessStatus: entry.accessStatus,
      activationState: entry.activationState,
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
      lastScheduledSync: latestScheduled
        ? {
            status: latestScheduled.status,
            timestamp: lastScheduledSyncAt,
            error: latestScheduled.error || null,
          }
        : null,
      scheduledSyncActive: false,
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

export async function runScheduledMetadataSync(userId?: string) {
  const summary = {
    totalSources: CONNECTOR_SOURCE_REGISTRY.length,
    eligible: 0,
    skipped: 0,
    passed: 0,
    failed: 0,
    noPropertyLevelVerification: true,
    runs: [] as Array<{
      connectorKey: string;
      status: string;
      reason?: string;
      error?: string | null;
    }>,
  };

  for (const entry of CONNECTOR_SOURCE_REGISTRY) {
    const policy = canRunScheduledMetadataSync(entry);
    if (!policy.allowed) {
      const skipRun = await createScheduledPolicySkip(entry, policy.reason, userId);
      summary.skipped += 1;
      summary.runs.push({
        connectorKey: entry.connectorKey,
        status: skipRun.status,
        reason: String(skipRun.responseSummary && (skipRun.responseSummary as any).reason ? (skipRun.responseSummary as any).reason : policy.reason),
        error: skipRun.error || null,
      });
      continue;
    }

    summary.eligible += 1;
    const run = await runConnectorSyncNow(entry.connectorKey, userId, 'SCHEDULED');
    if (run.status === 'SUCCESS') summary.passed += 1;
    if (run.status === 'FAILED') summary.failed += 1;
    if (run.status === 'SKIPPED' || run.status === 'BLOCKED') summary.skipped += 1;
    summary.runs.push({
      connectorKey: entry.connectorKey,
      status: run.status,
      error: run.error || null,
    });
  }

  return summary;
}
