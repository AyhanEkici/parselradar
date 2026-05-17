import React from 'react';

type ConfidenceCardProps = {
  confidence?: number;
  missingInputs?: string[];
  factorsUsed?: Record<string, unknown>;
  documentCount: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function indicatorTone(value: number) {
  if (value >= 75) return 'bg-emerald-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function ConfidenceCard({ confidence = 0, missingInputs = [], factorsUsed, documentCount }: ConfidenceCardProps) {
  const normalizedConfidence = clamp(confidence, 0, 100);
  const completeness = clamp(getNumber(factorsUsed?.inputCompleteness) ?? Math.max(0, 100 - missingInputs.length * 8), 0, 100);
  const docQuality = clamp(getNumber(factorsUsed?.documentQuality) ?? Math.min(100, documentCount * 18), 0, 100);

  const bullets: string[] = [];
  if (normalizedConfidence >= 75) bullets.push('High confidence from available structured inputs.');
  else if (normalizedConfidence >= 50) bullets.push('Moderate confidence; review additional evidence recommended.');
  else bullets.push('Low confidence due to limited validated inputs.');

  if (missingInputs.length > 0) bullets.push(`Missing inputs: ${missingInputs.join(', ')}.`);
  if (documentCount === 0) bullets.push('No supporting documents uploaded yet.');
  else bullets.push(`${documentCount} document(s) contribute to evidence coverage.`);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Confidence</h3>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-4xl font-semibold text-slate-900">{normalizedConfidence}%</div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Evidence-driven
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Data completeness</span>
            <span>{Math.round(completeness)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${indicatorTone(completeness)}`} style={{ width: `${completeness}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Document coverage</span>
            <span>{Math.round(docQuality)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${indicatorTone(docQuality)}`} style={{ width: `${docQuality}%` }} />
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-slate-600">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-[2px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
