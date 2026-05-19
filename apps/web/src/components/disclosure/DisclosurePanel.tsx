import React from 'react';

export default function DisclosurePanel({
  mode,
  lines,
}: {
  mode?: string;
  lines?: string[];
}) {
  const items = lines || [];
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Disclosure ({mode || 'CLIENT_VISIBLE'})</div>
      <ul className="mt-2 space-y-1 text-sm text-indigo-900">
        {items.length === 0 ? <li>Disclosure summary not available.</li> : items.map((line, idx) => <li key={`${idx}-${line.slice(0, 12)}`}>• {line}</li>)}
      </ul>
    </div>
  );
}
