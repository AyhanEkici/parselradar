import React from 'react';

type Props = {
  operationalSnapshot?: {
    generatedAt?: string;
    degradedQueues?: number;
    degradedWorkers?: number;
    mode?: string;
  };
  healthSummary?: {
    live?: string;
    ready?: string;
    overall?: string;
    detail?: string;
  };
};

export function OperationalSnapshotCard({ operationalSnapshot, healthSummary }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">Operational Snapshot</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-900">
        <div>Mode: {operationalSnapshot?.mode || '-'}</div>
        <div>Overall: {healthSummary?.overall || '-'}</div>
        <div>Live: {healthSummary?.live || '-'}</div>
        <div>Ready: {healthSummary?.ready || '-'}</div>
        <div>Degraded Queues: {operationalSnapshot?.degradedQueues ?? 0}</div>
        <div>Degraded Workers: {operationalSnapshot?.degradedWorkers ?? 0}</div>
      </div>
      <div className="mt-3 text-xs text-slate-700">{healthSummary?.detail || '-'}</div>
      <div className="mt-2 text-[11px] text-slate-500">Generated: {operationalSnapshot?.generatedAt || '-'}</div>
    </div>
  );
}
