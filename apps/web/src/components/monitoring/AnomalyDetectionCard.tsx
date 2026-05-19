import React from 'react';

export default function AnomalyDetectionCard({ anomaly }: { anomaly?: { level?: string; anomalyScore?: number; deltaRatio?: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Anomaly Detection</h3>
      <p className="mt-1 text-xs text-slate-700">Level: {anomaly?.level || '-'}</p>
      <p className="text-xs text-slate-700">Score: {anomaly?.anomalyScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Delta: {anomaly?.deltaRatio ?? '-'}</p>
    </div>
  );
}
