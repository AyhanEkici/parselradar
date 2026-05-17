import React from 'react';

type Props = {
  analysisVersion?: string;
  cacheTimestamp?: string;
};

export const AnalysisVersionCard: React.FC<Props> = ({ analysisVersion, cacheTimestamp }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Analysis Version</h3>
      <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
        <div className="text-xs text-indigo-700">Version</div>
        <div className="text-lg font-semibold text-indigo-900">{analysisVersion || 'V8'}</div>
      </div>
      <div className="mt-3 text-xs text-slate-600">
        Cache timestamp: {cacheTimestamp ? new Date(cacheTimestamp).toLocaleString() : 'not cached'}
      </div>
    </div>
  );
};
