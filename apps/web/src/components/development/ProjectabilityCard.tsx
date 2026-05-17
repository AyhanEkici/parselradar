import React from 'react';

interface ProjectabilityCardProps {
  projectability?: {
    level: string;
    score: number;
    constraints: string[];
    recommendations: string[];
  };
}

export const ProjectabilityCard: React.FC<ProjectabilityCardProps> = ({ projectability }) => {
  if (!projectability) return null;

  const getLevelColor = (level: string) => {
    const normalized = (level || '').toLowerCase();
    if (normalized === 'easy') return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    if (normalized === 'moderate') return 'bg-amber-100 text-amber-900 border-amber-200';
    return 'bg-red-100 text-red-900 border-red-200';
  };

  const getLevelEmoji = (level: string) => {
    const normalized = (level || '').toLowerCase();
    if (normalized === 'easy') return '✅';
    if (normalized === 'moderate') return '⚠️';
    return '🚧';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Projectability</h3>
        <p className="text-sm text-gray-600">Development complexity assessment</p>
      </div>

      <div className={`rounded-lg border ${getLevelColor(projectability.level)} p-3 mb-3 text-center`}>
        <div className="text-3xl mb-1">{getLevelEmoji(projectability.level)}</div>
        <div className="font-semibold capitalize text-sm mb-1">{projectability.level} to Develop</div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="h-2.5 flex-1 rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
            style={{
              width: `${Math.min(projectability.score, 100)}%`,
            }}
          />
        </div>
        <span className="text-sm font-bold w-8">{projectability.score}</span>
      </div>

      {projectability.constraints.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1.5">Constraints:</div>
          <ul className="space-y-1 text-xs text-gray-700">
            {projectability.constraints.map((constraint, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="text-red-500 flex-shrink-0">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {projectability.recommendations.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-700 mb-1.5">Recommendations:</div>
          <ul className="space-y-1 text-xs text-gray-700">
            {projectability.recommendations.map((recommendation, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="text-emerald-500 flex-shrink-0">→</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
