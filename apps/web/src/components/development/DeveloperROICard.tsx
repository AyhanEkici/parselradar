import React from 'react';

interface DeveloperROICardProps {
  developerROI?: { tier: string; score: number; description: string };
}

export const DeveloperROICard: React.FC<DeveloperROICardProps> = ({ developerROI }) => {
  if (!developerROI) return null;

  const tierColor = {
    conservative: 'bg-blue-100 text-blue-900 border-blue-200',
    moderate: 'bg-amber-100 text-amber-900 border-amber-200',
    aggressive: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  };

  const tierEmoji = {
    conservative: '🛡️',
    moderate: '⚖️',
    aggressive: '🚀',
  };

  const normalizedTier = (developerROI.tier || 'moderate').toLowerCase() as keyof typeof tierColor;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Developer ROI Profile</h3>
        <p className="text-sm text-gray-600">Risk-return classification</p>
      </div>

      <div className={`rounded-lg border ${tierColor[normalizedTier]} p-4 text-center`}>
        <div className="text-3xl mb-2">{tierEmoji[normalizedTier] || '💼'}</div>
        <div className="text-lg font-bold capitalize mb-1">{developerROI.tier} Profile</div>
        <div className="text-sm opacity-80 mb-3">{developerROI.description}</div>

        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-32 rounded-full bg-gray-300">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 transition-all"
              style={{
                width: `${Math.min(developerROI.score, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-bold w-8">{developerROI.score}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 px-2">
        {normalizedTier === 'conservative' && 'Low-risk development with modest returns. Suitable for stable, established zones.'}
        {normalizedTier === 'moderate' && 'Balanced risk-return profile. Moderate complexity with reasonable upside.'}
        {normalizedTier === 'aggressive' && 'Higher risk profile with significant upside potential. Requires experienced developer.'}
      </div>
    </div>
  );
};
