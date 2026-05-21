import React from 'react';
import { MapRenderDiagnostics } from './types';
import OverlayHealthBadge from './OverlayHealthBadge';

function summarizeStatus(diag: MapRenderDiagnostics): 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' {
  if (diag.failedLayerLoads.length > 0 || diag.unavailableProviders.length > 0) return 'UNAVAILABLE';
  if (diag.tileFailures > 0 || diag.crsMismatches.length > 0 || diag.unsupportedProjectionLayers.length > 0) return 'DEGRADED';
  return 'HEALTHY';
}

export default function MapDiagnosticsPanel({ diagnostics }: { diagnostics: MapRenderDiagnostics }) {
  const status = summarizeStatus(diagnostics);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Map Diagnostics</h3>
        <OverlayHealthBadge status={status} latencyMs={diagnostics.overlayRenderLatencyMs} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">tile failures: {diagnostics.tileFailures}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">successful tile req: {diagnostics.successfulTileRequests}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">crs mismatches: {diagnostics.crsMismatches.length}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">unsupported projection: {diagnostics.unsupportedProjectionLayers.length}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">empty layers: {diagnostics.emptyLayerResponses.length}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">timeout layers: {diagnostics.timeoutLayers.length}</div>
      </div>
      <ul className="mt-3 space-y-1 text-[11px] text-slate-600">
        {diagnostics.unavailableProviders.map((provider) => (
          <li key={`provider-${provider}`}>provider unavailable: {provider}</li>
        ))}
        {diagnostics.failedLayerLoads.map((layer) => (
          <li key={`layer-${layer}`}>layer load failed: {layer}</li>
        ))}
      </ul>
    </div>
  );
}
