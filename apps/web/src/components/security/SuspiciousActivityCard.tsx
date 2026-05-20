import React from 'react';

export default function SuspiciousActivityCard({ activity }: { activity?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Suspicious Activity</h3>
      <p className="mt-2 text-xs text-slate-700">Suspicious: {activity?.suspicious ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">Score: {activity?.score ?? '-'}</p>
    </div>
  );
}
