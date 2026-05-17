import React from 'react';

interface InfrastructureCardProps {
  infrastructureScore: number;
  roadAccessScore: number;
  utilityCoverage?: {
    electricityScore: number;
    waterScore: number;
    gasScore: number;
    internetScore: number;
    totalScore: number;
  };
}

export const InfrastructureCard: React.FC<InfrastructureCardProps> = ({
  infrastructureScore,
  roadAccessScore,
  utilityCoverage,
}) => {
  const infra = infrastructureScore || 0;
  const road = roadAccessScore || 0;
  const utilities = utilityCoverage?.totalScore || 0;

  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    if (score >= 60) return 'bg-blue-50 border-blue-200 text-blue-900';
    if (score >= 40) return 'bg-amber-50 border-amber-200 text-amber-900';
    return 'bg-red-50 border-red-200 text-red-900';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Infrastructure Readiness</h3>
        <p className="text-sm text-gray-600">Access and utilities assessment</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Overall Infrastructure</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(infra, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-10">{infra}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Road Access</span>
          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getColorClass(road)}`}>
            {road}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Utility Coverage</span>
          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getColorClass(utilities)}`}>
            {utilities}%
          </span>
        </div>

        {utilityCoverage && (
          <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-600">Electricity</div>
              <div className="text-sm font-semibold text-gray-900">{utilityCoverage.electricityScore}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Water</div>
              <div className="text-sm font-semibold text-gray-900">{utilityCoverage.waterScore}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
