import React from 'react';

interface DevelopmentScenarioTimelineProps {
  developmentScenario?: {
    subdivisionPotential: { potential: string; score: number };
    densityPotential: { classification: string; score: number };
    projectability: { level: string; score: number };
    developerROI: { tier: string; score: number };
  };
}

export const DevelopmentScenarioTimeline: React.FC<DevelopmentScenarioTimelineProps> = ({
  developmentScenario,
}) => {
  if (!developmentScenario) return null;

  const phases = [
    {
      title: 'Phase 1: Due Diligence',
      description: `Land split: ${developmentScenario.subdivisionPotential.potential}`,
      indicator: developmentScenario.subdivisionPotential.potential,
    },
    {
      title: 'Phase 2: Planning',
      description: `Density: ${developmentScenario.densityPotential.classification}`,
      indicator: 'planning',
    },
    {
      title: 'Phase 3: Development',
      description: `Complexity: ${developmentScenario.projectability.level}`,
      indicator: developmentScenario.projectability.level,
    },
    {
      title: 'Phase 4: Returns',
      description: `ROI tier: ${developmentScenario.developerROI.tier}`,
      indicator: developmentScenario.developerROI.tier,
    },
  ];

  const getIndicatorColor = (indicator: string) => {
    const normalized = (indicator || '').toLowerCase();
    if (
      normalized === 'high' ||
      normalized === 'aggressive' ||
      normalized === 'easy' ||
      normalized === 'excellent'
    ) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (normalized === 'medium' || normalized === 'moderate' || normalized === 'adequate') {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (
      normalized === 'low' ||
      normalized === 'conservative' ||
      normalized === 'difficult' ||
      normalized === 'poor'
    ) {
      return 'bg-red-100 text-red-900 border-red-300';
    }
    return 'bg-blue-100 text-blue-900 border-blue-300';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Development Timeline</h3>
        <p className="text-sm text-gray-600">Project scenario progression</p>
      </div>

      <div className="space-y-3">
        {phases.map((phase, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-700">{idx + 1}</span>
              </div>
              {idx < phases.length - 1 && <div className="w-0.5 h-12 bg-indigo-200 my-1" />}
            </div>
            <div className="pb-2 flex-1">
              <div className="font-medium text-gray-900">{phase.title}</div>
              <div className="text-sm text-gray-600 mb-2">{phase.description}</div>
              <div className={`inline-block px-2.5 py-1 rounded-full border text-xs font-medium ${getIndicatorColor(phase.indicator)}`}>
                {phase.indicator}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
