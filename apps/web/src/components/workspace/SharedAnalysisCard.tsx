import React from 'react';

type Props = { row: any };

export default function SharedAnalysisCard({ row }: Props) {
  const property = row.propertySubmissionId || {};
  const analysis = row.analysisRunId || {};
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{property.addressText || `${property.il || '-'} / ${property.ilce || '-'}`}</div>
      <div className="mt-1 text-xs text-slate-600">Signal: {analysis.signal || '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Score: {analysis.score ?? '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Source/Freshness: {analysis.sourceConfidence || '-'} / {analysis?.fullAnalysis?.freshnessScore ?? '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Version: {analysis.analysisVersion || '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Shared by: {row.sharedByUserId?.name || '-'}</div>
    </div>
  );
}
