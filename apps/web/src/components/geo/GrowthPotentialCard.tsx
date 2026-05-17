import React from 'react';

interface GrowthPotentialCardProps {
  growthPotential?: {
    growthScore: number;
    developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
    growthIndicators: number;
  };
}

export const GrowthPotentialCard: React.FC<GrowthPotentialCardProps> = ({ growthPotential }) => {
  if (!growthPotential) return null;

  const { growthScore, developmentPhase, growthIndicators } = growthPotential;

  const phaseColor = {
    emerging: 'from-purple-400 to-pink-400',
    developing: 'from-blue-400 to-cyan-400',
    mature: 'from-emerald-400 to-teal-400',
    saturated: 'from-slate-400 to-gray-400',
  };

  const phaseLabel = {
    emerging: 'Emerging Zone',
    developing: 'Developing Zone',
    mature: 'Mature Zone',
    saturated: 'Saturated Zone',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Growth Potential</h3>
        <p className="text-sm text-gray-600">Development phase & indicators</p>
      </div>

      <div className="space-y-3">
        <div className={`bg-gradient-to-r ${phaseColor[developmentPhase]} rounded-lg p-3 text-white text-center`}>
          <div className="text-sm font-semibold">{phaseLabel[developmentPhase]}</div>
          <div className="text-xs opacity-90 mt-1">Growth Score: {growthScore}</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 font-medium">Development Index</span>
            <span className="text-sm font-semibold text-gray-900">{growthIndicators}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{
                width: `${Math.min(growthIndicators, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-600 px-2">
          {developmentPhase === 'emerging' && 'Early-stage zone with high infrastructure expansion potential.'}
          {developmentPhase === 'developing' && 'Zone in active development phase with multiple projects.'}
          {developmentPhase === 'mature' && 'Fully developed zone with established infrastructure.'}
          {developmentPhase === 'saturated' && 'Mature zone with limited additional development.'}
        </div>
      </div>
    </div>
  );
};
