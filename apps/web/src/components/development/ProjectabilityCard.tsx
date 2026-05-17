import React from 'react';

type Props = {
  projectability?: {
    score: number;
    level: 'easy' | 'moderate' | 'difficult';
    blockers: string[];
  };
  frontageDepthScore?: {
    score: number;
    geometrySignals: string[];
  };
};

export const ProjectabilityCard: React.FC<Props> = ({ projectability, frontageDepthScore }) => {
  if (!projectability) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Projectability</h3>
          <p className="mt-1 text-xs text-slate-600">Geometry, access, and execution difficulty</p>
        </div>
        <div className="text-lg font-semibold text-slate-900">{projectability.score}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-xs text-slate-600">Execution</div>
          <div className="text-base font-semibold capitalize text-slate-900">{projectability.level}</div>
        </div>
        {frontageDepthScore && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-600">Geometry</div>
            <div className="text-base font-semibold text-slate-900">{frontageDepthScore.score}</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(frontageDepthScore?.geometrySignals || []).map((signal) => (
          <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
        {projectability.blockers.map((blocker) => (
          <span key={blocker} className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs text-red-700">
            {blocker.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
