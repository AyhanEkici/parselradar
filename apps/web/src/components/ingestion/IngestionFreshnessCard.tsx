import React from 'react';

export default function IngestionFreshnessCard({
  cacheEnvelope,
}: {
  cacheEnvelope?: { freshnessScore?: number; cacheState?: string; generatedAt?: string };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Ingestion Freshness</h3>
      <div className="mt-2 text-xs text-gray-700">Score: {cacheEnvelope?.freshnessScore ?? '-'}</div>
      <div className="text-xs text-gray-700">State: {cacheEnvelope?.cacheState || '-'}</div>
      <div className="text-xs text-gray-500">Generated: {cacheEnvelope?.generatedAt || '-'}</div>
    </div>
  );
}
