import React from 'react';

export default function ConnectorHealthCard({
  connectors,
}: {
  connectors?: Array<{ connectorKey: string; status: string; freshnessState: string }>;
}) {
  const rows = connectors || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Connector Health</h3>
      <div className="mt-2 space-y-2 text-xs text-gray-700">
        {rows.slice(0, 8).map((row) => (
          <div key={row.connectorKey} className="rounded bg-gray-50 px-2 py-1">
            {row.connectorKey}: {row.status} ({row.freshnessState})
          </div>
        ))}
      </div>
    </div>
  );
}
