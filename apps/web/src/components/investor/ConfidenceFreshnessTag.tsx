import React from 'react';

type Props = {
  sourceConfidence?: string;
  freshnessScore?: number;
  analysisVersion?: string;
};

export default function ConfidenceFreshnessTag({ sourceConfidence, freshnessScore, analysisVersion }: Props) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-xs text-slate-600">
      <span className="rounded-md bg-slate-100 px-2 py-1">Source: {sourceConfidence || '-'}</span>
      <span className="rounded-md bg-slate-100 px-2 py-1">Freshness: {freshnessScore ?? '-'}</span>
      <span className="rounded-md bg-slate-100 px-2 py-1">Version: {analysisVersion || '-'}</span>
    </div>
  );
}
