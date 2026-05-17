import React from 'react';

interface SubdivisionCardProps {
  subdivisionPotential?: { potential: string; score: number; message: string };
}

export const SubdivisionCard: React.FC<SubdivisionCardProps> = ({ subdivisionPotential }) => {
  if (!subdivisionPotential) return null;

  const getPotentialBadge = (potential: string) => {
    const normalized = (potential || '').toLowerCase();
    if (normalized === 'high') return { color: 'bg-emerald-100 text-emerald-900 border-emerald-200', label: '✅ High' };
    if (normalized === 'medium') return { color: 'bg-amber-100 text-amber-900 border-amber-200', label: '⚡ Medium' };
    return { color: 'bg-red-100 text-red-900 border-red-200', label: '❌ Low' };
  };

  const badge = getPotentialBadge(subdivisionPotential.potential);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Subdivision Potential</h3>
        <p className="text-sm text-gray-600">Land split opportunity</p>
      </div>

      <div className={`rounded-lg border ${badge.color} p-4 text-center mb-3`}>
        <div className="text-2xl mb-1">{badge.label}</div>
        <div className="text-xs opacity-80">{subdivisionPotential.message}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-500 transition-all"
            style={{
              width: `${Math.min(subdivisionPotential.score, 100)}%`,
            }}
          />
        </div>
        <span className="text-sm font-bold w-8">{subdivisionPotential.score}</span>
      </div>
    </div>
  );
};
