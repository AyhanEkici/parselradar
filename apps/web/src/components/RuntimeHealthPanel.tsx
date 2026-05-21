import React from 'react';

type RuntimeHealthData = {
  generatedAt?: string;
  runtimeStatus?: { state?: string; reason?: string; mode?: string };
  healthSummary?: { overall?: string; live?: string; ready?: string; detail?: string };
  failedRequestSummary?: { totalFailedRequests?: number; statusCounters?: Record<string, number> };
  failedRequestsTimeline?: Array<{ at: string; path: string; method: string; status: number; requestId: string }>;
  authFailureSummary?: { totalAuthFailures?: number; recent?: Array<{ at: string; reason: string; email?: string }> };
};

export default function RuntimeHealthPanel({ data }: { data: RuntimeHealthData | null }) {
  const timeline = data?.failedRequestsTimeline || [];
  const authFailures = data?.authFailureSummary?.recent || [];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Runtime Health</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-3">
          <div>State: {data?.runtimeStatus?.state || '-'}</div>
          <div>Mode: {data?.runtimeStatus?.mode || '-'}</div>
          <div>Overall: {data?.healthSummary?.overall || '-'}</div>
        </div>
        <div className="mt-2 text-xs text-slate-600">{data?.healthSummary?.detail || '-'}</div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Failed Requests</h3>
        <div className="mt-2 text-xs text-slate-700">
          Total: {data?.failedRequestSummary?.totalFailedRequests ?? 0}
        </div>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {timeline.length === 0 ? <li>No failed requests recorded.</li> : null}
          {timeline.slice(0, 8).map((item, index) => (
            <li key={`${item.requestId}-${index}`}>
              {new Date(item.at).toLocaleString()} | {item.method} {item.path} | {item.status} | {item.requestId}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Auth Failure Visibility</h3>
        <div className="mt-2 text-xs text-slate-700">
          Total: {data?.authFailureSummary?.totalAuthFailures ?? 0}
        </div>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {authFailures.length === 0 ? <li>No auth failures recorded.</li> : null}
          {authFailures.slice(0, 8).map((item, index) => (
            <li key={`${item.at}-${index}`}>
              {new Date(item.at).toLocaleString()} | {item.reason} {item.email ? `| ${item.email}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
