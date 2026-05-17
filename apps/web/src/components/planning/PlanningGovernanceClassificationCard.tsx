import React from 'react';

type Props = {
  governance?: {
    governanceClasses?: string[];
    note?: string;
  } | null;
};

export default function PlanningGovernanceClassificationCard({ governance }: Props) {
  const classes = governance?.governanceClasses || [
    'VERIFIED_FACT',
    'DERIVED_ANALYTIC',
    'HEURISTIC_SIGNAL',
    'INCOMPLETE_DATA',
    'HUMAN_REVIEW_ADVISED',
  ];

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Planning Governance</div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {classes.map((c) => (
          <div key={c} className="rounded-md bg-white/60 px-3 py-2 text-xs font-semibold text-indigo-900">
            {c}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-indigo-900">
        {governance?.note || 'All planning outputs must be classified. Human review is advised; no guaranteed zoning or ROI claims.'}
      </div>
    </div>
  );
}

