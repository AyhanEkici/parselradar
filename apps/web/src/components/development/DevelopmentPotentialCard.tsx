import React from 'react';

interface DevelopmentPotentialCardProps {
  subdivisionPotential?: { potential: string; score: number; message: string };
  frontageDepthScore?: {
    score: number;
    frontageScore: number;
    depthScore: number;
    quality: string;
  };
  densityPotential?: { classification: string; score: number };
}

export const DevelopmentPotentialCard: React.FC<DevelopmentPotentialCardProps> = ({
  subdivisionPotential,
  frontageDepthScore,
  densityPotential,
}) => {
  const getQualityColor = (quality: string) => {
    const normalizedQuality = (quality || '').toLowerCase();
    if (normalizedQuality === 'excellent') return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    if (normalizedQuality === 'good') return 'bg-blue-100 text-blue-900 border-blue-200';
    if (normalizedQuality === 'adequate') return 'bg-amber-100 text-amber-900 border-amber-200';
    return 'bg-red-100 text-red-900 border-red-200';
  };

  const getPotentialColor = (potential: string) => {
    const normalizedPotential = (potential || '').toLowerCase();
    if (normalizedPotential === 'high') return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    if (normalizedPotential === 'medium') return 'bg-blue-50 text-blue-900 border-blue-200';
    return 'bg-gray-50 text-gray-900 border-gray-200';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Development Potential</h3>
        <p className="text-sm text-gray-600">Parcel development suitability</p>
      </div>

      <div className="space-y-3">
        {subdivisionPotential && (
          <div className={`rounded-lg border p-3 ${getPotentialColor(subdivisionPotential.potential)}`}>
            <div className="font-medium text-sm mb-1 capitalize">{subdivisionPotential.potential} Subdivision Potential</div>
            <div className="text-xs opacity-80">{subdivisionPotential.message}</div>
            <div className="mt-1 text-xs font-semibold">Score: {subdivisionPotential.score}</div>
          </div>
        )}

        {frontageDepthScore && (
          <div className={`rounded-lg border p-3 ${getQualityColor(frontageDepthScore.quality)}`}>
            <div className="font-medium text-sm mb-1 capitalize">Parcel Geometry: {frontageDepthScore.quality}</div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div>
                <span className="opacity-70">Frontage:</span> {frontageDepthScore.frontageScore}
              </div>
              <div>
                <span className="opacity-70">Depth:</span> {frontageDepthScore.depthScore}
              </div>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-opacity-20 bg-current">
              <div
                className="h-full rounded-full bg-current transition-all"
                style={{ width: `${Math.min(frontageDepthScore.score, 100)}%` }}
              />
            </div>
          </div>
        )}

        {densityPotential && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <div className="font-medium text-sm text-indigo-900 mb-1 capitalize">Density: {densityPotential.classification}</div>
            <div className="text-xs text-indigo-800">Development density potential score</div>
            <div className="mt-1 text-sm font-semibold text-indigo-900">{densityPotential.score}/100</div>
          </div>
        )}
      </div>
    </div>
  );
};
