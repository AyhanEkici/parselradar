import React from 'react';

export default function OgcServiceDiagnosticsCard({ services }: { services: any[] }) {
  const renderState = (service: any) => {
    const state = String(service?.state || '').toUpperCase();
    const errorCode = String(service?.errorCode || '').toUpperCase();

    if (state === 'NOT_CONFIGURED' && errorCode.startsWith('MISSING_')) {
      return {
        label: 'NOT_CONFIGURED',
        className: 'text-amber-700',
      };
    }

    if (state === 'FAILED') {
      return {
        label: 'FAILED',
        className: 'text-red-700',
      };
    }

    if (state === 'ACTIVE' || state === 'TEST_PASSED') {
      return {
        label: state,
        className: 'text-emerald-700',
      };
    }

    return {
      label: state || 'UNKNOWN',
      className: 'text-slate-700',
    };
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">OGC Capability Diagnostics</h3>
      <ul className="mt-2 space-y-2 text-xs text-slate-700">
        {(services || []).length === 0 ? <li>No service diagnostics.</li> : null}
        {(services || []).map((service) => {
          const stateInfo = renderState(service);
          const reason = service.message || service.error;
          const action = service.action;
          return (
            <li key={service.service} className="rounded border border-slate-200 p-2">
              <div>{service.service} | {service.available ? 'available' : 'unavailable'} | parse={service.parseState}</div>
              <div>Status: <span className={stateInfo.className}>{stateInfo.label}</span></div>
              <div>latency={service.latencyMs}ms | layers={service.layerCount}</div>
              <div>projections={(service.projectionSupport || []).join(', ') || '-'}</div>
              {service.errorCode ? <div className="text-slate-600">Error code: {service.errorCode}</div> : null}
              {reason ? <div className={stateInfo.className}>Reason: {reason}</div> : null}
              {action ? <div className="text-slate-600">Action: {action}</div> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
