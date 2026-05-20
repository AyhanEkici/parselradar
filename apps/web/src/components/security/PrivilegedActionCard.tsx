import React from 'react';

export default function PrivilegedActionCard({ action }: { action?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Privileged Action</h3>
      <p className="mt-2 text-xs text-slate-700">Action: {action?.action || '-'}</p>
      <p className="text-xs text-slate-700">Review: {action?.reviewState || '-'}</p>
    </div>
  );
}
