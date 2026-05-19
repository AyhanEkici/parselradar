import React from 'react';

export default function ConnectorGovernanceCard({ governance }: { governance?: { statusCounts?: Record<string, number> } }) {
  const counts = governance?.statusCounts || {};
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Connector Governance</h3>
      <p className="mt-1 text-xs text-gray-500">Manual activation workflow with reviewable states.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded bg-gray-50 px-2 py-1">
            <span className="font-medium">{key}</span>: {value}
          </div>
        ))}
      </div>
    </div>
  );
}
