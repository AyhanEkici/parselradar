import React from 'react';

interface RezoningUpsideCardProps {
  rezoningUpside?: {
    scenario: string;
    score: number;
    multiplier: number;
    probability: number;
    message: string;
  };
}

export const RezoningUpsideCard: React.FC<RezoningUpsideCardProps> = ({ rezoningUpside }) => {
  if (!rezoningUpside) return null;

  const scenarioColor = {
    stable: 'bg-slate-100 text-slate-900 border-slate-200',
    moderate_upside: 'bg-blue-100 text-blue-900 border-blue-200',
    speculative_upside: 'bg-amber-100 text-amber-900 border-amber-200',
    infrastructure_linked: 'bg-purple-100 text-purple-900 border-purple-200',
  };

  const normalizedScenario = (rezoningUpside.scenario || 'stable').toLowerCase() as keyof typeof scenarioColor;
  const color = scenarioColor[normalizedScenario] || scenarioColor.stable;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Rezoning Upside</h3>
        <p className="text-sm text-gray-600">Zoning change scenario</p>
      </div>

      <div className={`rounded-lg border ${color} p-3 mb-3`}>
        <div className="font-medium text-sm capitalize mb-1">{rezoningUpside.scenario.replace(/_/g, ' ')}</div>
        <div className="text-xs opacity-80">{rezoningUpside.message}</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Upside Multiplier</span>
          <span className="font-semibold text-gray-900">{rezoningUpside.multiplier.toFixed(2)}x</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Probability of Hold</span>
          <span className="font-semibold text-gray-900">{Math.round(rezoningUpside.probability * 100)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Scenario Score</span>
          <span className="font-semibold text-gray-900">{rezoningUpside.score}/100</span>
        </div>
      </div>
    </div>
  );
};
