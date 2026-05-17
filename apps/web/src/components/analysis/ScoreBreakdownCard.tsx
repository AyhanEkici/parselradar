import React from 'react';

type ScoreBreakdownCardProps = {
  score: number;
  confidence?: number;
  factorsUsed?: Record<string, unknown>;
};

type FactorRow = {
  key: string;
  label: string;
  value: number;
  weight: number;
  direction: 'positive' | 'negative' | 'neutral';
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toPercent(value: number) {
  return `${Math.round(value)}%`;
}

function directionFromValue(value: number): FactorRow['direction'] {
  if (value >= 70) return 'positive';
  if (value <= 45) return 'negative';
  return 'neutral';
}

function buildRows(factorsUsed?: Record<string, unknown>): FactorRow[] {
  const scoreMap: Array<{ key: string; label: string; weight: number }> = [
    { key: 'inputCompleteness', label: 'Data completeness', weight: 0.14 },
    { key: 'documentQuality', label: 'Document quality', weight: 0.1 },
    { key: 'developerFitScore', label: 'Developer fit', weight: 0.24 },
    { key: 'zoningPotentialScore', label: 'Zoning potential', weight: 0.18 },
    { key: 'parcelReadinessScore', label: 'Parcel readiness', weight: 0.12 },
  ];

  return scoreMap
    .map((f) => {
      const value = getNumber(factorsUsed?.[f.key]);
      if (value == null) return null;
      return {
        key: f.key,
        label: f.label,
        value: clamp(value, 0, 100),
        weight: f.weight,
        direction: directionFromValue(value),
      } as FactorRow;
    })
    .filter((row): row is FactorRow => Boolean(row));
}

export function ScoreBreakdownCard({ score, confidence = 0, factorsUsed }: ScoreBreakdownCardProps) {
  const rows = buildRows(factorsUsed);

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Score Breakdown</h3>
        <p className="mt-2 text-sm text-slate-500">No weighted breakdown data available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Score Breakdown</h3>
          <p className="mt-1 text-xs text-slate-500">Weighted factors and confidence influence</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-right">
          <div className="text-xs font-medium text-blue-700">Overall score</div>
          <div className="text-xl font-semibold text-blue-900">{score}</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const fill = clamp(row.value, 0, 100);
          const tone =
            row.direction === 'positive'
              ? 'bg-emerald-500'
              : row.direction === 'negative'
              ? 'bg-red-500'
              : 'bg-slate-500';

          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="font-medium text-slate-700">{row.label}</div>
                <div className="text-slate-600">
                  {toPercent(row.value)} · weight {(row.weight * 100).toFixed(0)}%
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${tone}`} style={{ width: `${fill}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Confidence influence: <span className="font-semibold text-slate-800">{toPercent(confidence)}</span>
      </div>
    </section>
  );
}
