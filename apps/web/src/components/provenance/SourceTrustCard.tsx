import React from 'react';

export default function SourceTrustCard({
  trust,
}: {
  trust?: { trustScore?: number; trustLabel?: string; reliability?: { reliability?: number; label?: string } };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Source Trust</h3>
      <p className="mt-1 text-xs text-gray-700">Trust Score: {trust?.trustScore ?? '-'}</p>
      <p className="text-xs text-gray-700">Trust Label: {trust?.trustLabel || '-'}</p>
      <p className="text-xs text-gray-700">Reliability: {trust?.reliability?.reliability ?? '-'} ({trust?.reliability?.label || '-'})</p>
    </div>
  );
}
