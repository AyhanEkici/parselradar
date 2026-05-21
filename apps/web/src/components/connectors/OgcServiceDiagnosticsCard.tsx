import React from 'react';

export default function OgcServiceDiagnosticsCard({ services }: { services: any[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">OGC Capability Diagnostics</h3>
      <ul className="mt-2 space-y-2 text-xs text-slate-700">
        {(services || []).length === 0 ? <li>No service diagnostics.</li> : null}
        {(services || []).map((service) => (
          <li key={service.service} className="rounded border border-slate-200 p-2">
            <div>{service.service} | {service.available ? 'available' : 'unavailable'} | parse={service.parseState}</div>
            <div>latency={service.latencyMs}ms | layers={service.layerCount}</div>
            <div>projections={(service.projectionSupport || []).join(', ') || '-'}</div>
            {service.error ? <div className="text-amber-700">error={service.error}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
