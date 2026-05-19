import React from 'react';

export default function InfrastructureExpansionCard({ expansion }: { expansion?: { direction?: string; projects?: Array<{ at?: string; project?: string; status?: string }> } }) {
  const projects = expansion?.projects || [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Infrastructure Expansion</h3>
      <p className="mt-1 text-xs text-slate-700">Direction: {expansion?.direction || '-'}</p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        {projects.slice(0, 4).map((project, idx) => (
          <div key={`${project.at}-${idx}`}>{project.at} | {project.project} | {project.status}</div>
        ))}
      </div>
    </div>
  );
}
