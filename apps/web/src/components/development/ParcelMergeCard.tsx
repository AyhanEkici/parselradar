import React from 'react';

interface ParcelMergeCardProps {
  parcelMergeOpportunity?: {
    opportunity: boolean;
    score: number;
    signals: string[];
    message: string;
  };
}

export const ParcelMergeCard: React.FC<ParcelMergeCardProps> = ({ parcelMergeOpportunity }) => {
  if (!parcelMergeOpportunity) return null;

  const { opportunity, score, signals, message } = parcelMergeOpportunity;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Parcel Assembly</h3>
        <p className="text-sm text-gray-600">Merge & aggregation opportunity</p>
      </div>

      {opportunity ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔗</span>
              <span className="font-semibold text-emerald-900">Assembly Opportunity</span>
            </div>
            <div className="text-sm text-emerald-800">{message}</div>
          </div>

          {signals.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Merge Signals ({signals.length}):</div>
              <div className="flex flex-wrap gap-1.5">
                {signals.map((signal) => (
                  <span
                    key={signal}
                    className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-medium"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-700">Assembly Score</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 w-8">{score}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
          <div className="text-3xl mb-1">—</div>
          <div className="text-sm text-gray-600">{message}</div>
        </div>
      )}
    </div>
  );
};
