import React from 'react';

interface GeoIntelligenceGridProps {
  infrastructureScore: number;
  roadAccessScore: number;
  utilityCoverage?: {
    electricityScore: number;
    waterScore: number;
    sewageScore: number;
    gasScore: number;
    internetScore: number;
    totalScore: number;
  };
  growthPotential?: {
    growthScore: number;
    developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
    growthIndicators: number;
  };
  regionalDemand?: {
    demandLevel: 'cold' | 'stable' | 'active' | 'high_growth';
    demandScore: number;
  };
  strategicLocationSignals: string[];
  geoSummary?: string;
}

export const GeoIntelligenceGrid: React.FC<GeoIntelligenceGridProps> = ({
  infrastructureScore,
  roadAccessScore,
  utilityCoverage,
  growthPotential,
  regionalDemand,
  strategicLocationSignals,
  geoSummary,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Geographic Intelligence Summary</h3>
        <p className="text-sm text-gray-600">Location & infrastructure analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <div className={`rounded-lg p-3 ${getScoreColor(infrastructureScore)}`}>
          <div className="text-xs text-gray-600 font-medium">Infrastructure</div>
          <div className="text-2xl font-bold mt-1">{infrastructureScore}</div>
        </div>

        <div className={`rounded-lg p-3 ${getScoreColor(roadAccessScore)}`}>
          <div className="text-xs text-gray-600 font-medium">Road Access</div>
          <div className="text-2xl font-bold mt-1">{roadAccessScore}</div>
        </div>

        {utilityCoverage && (
          <div className={`rounded-lg p-3 ${getScoreColor(utilityCoverage.totalScore)}`}>
            <div className="text-xs text-gray-600 font-medium">Utilities</div>
            <div className="text-2xl font-bold mt-1">{utilityCoverage.totalScore}%</div>
          </div>
        )}

        {growthPotential && (
          <div className={`rounded-lg p-3 ${getScoreColor(growthPotential.growthScore)}`}>
            <div className="text-xs text-gray-600 font-medium">Growth Potential</div>
            <div className="text-2xl font-bold mt-1">{growthPotential.growthScore}</div>
          </div>
        )}
      </div>

      {geoSummary && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
          <p className="text-sm text-gray-700">{geoSummary}</p>
        </div>
      )}

      {strategicLocationSignals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-700 mb-2">Strategic Signals: {strategicLocationSignals.length}</div>
          <div className="flex flex-wrap gap-1">
            {strategicLocationSignals.map((signal) => (
              <span
                key={signal}
                className="inline-block px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-900 border border-indigo-200"
              >
                {signal.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
