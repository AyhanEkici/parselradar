import React from 'react';

export default function EvolutionTimelineCard({ timeline }: { timeline?: { direction?: string; events?: Array<{ at?: string; label?: string; source?: string }> } }) {
  const events = timeline?.events || [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Evolution Timeline</h3>
      <p className="mt-1 text-xs text-slate-700">Direction: {timeline?.direction || '-'}</p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        {events.slice(0, 5).map((event, idx) => (
          <div key={`${event.at}-${idx}`}>{event.at} | {event.label} | {event.source}</div>
        ))}
      </div>
    </div>
  );
}
