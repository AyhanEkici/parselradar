import React from 'react';

export default function IngestionAuditCard({
  auditTrail,
}: {
  auditTrail?: { totalEvents?: number; hasFailures?: boolean; latestEvents?: Array<{ connectorKey: string; action: string; timestamp: string }> };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Ingestion Audit</h3>
      <p className="mt-1 text-xs text-gray-700">Events: {auditTrail?.totalEvents ?? 0}</p>
      <p className="text-xs text-gray-700">Failures: {auditTrail?.hasFailures ? 'Yes' : 'No'}</p>
      <div className="mt-2 space-y-1">
        {(auditTrail?.latestEvents || []).slice(-5).map((event, idx) => (
          <div key={`${event.connectorKey}-${idx}`} className="text-xs text-gray-600">
            {event.timestamp}: {event.connectorKey} {event.action}
          </div>
        ))}
      </div>
    </div>
  );
}
