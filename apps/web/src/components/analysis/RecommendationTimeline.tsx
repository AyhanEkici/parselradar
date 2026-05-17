import React from 'react';

type RecommendationTimelineProps = {
  recommendation?: string;
  recommendations?: string[];
  risks?: string[];
  missingInputs?: string[];
  marketPosition?: string;
  developerFit?: string;
};

type TimelineItem = {
  phase: 'Immediate' | 'Due diligence' | 'Developer strategy' | 'Valuation warning';
  text: string;
};

function buildTimeline({ recommendation, recommendations = [], risks = [], missingInputs = [], marketPosition, developerFit }: RecommendationTimelineProps): TimelineItem[] {
  const items: TimelineItem[] = [];

  const immediate = recommendation || recommendations[0];
  if (immediate) {
    items.push({ phase: 'Immediate', text: immediate });
  } else {
    items.push({ phase: 'Immediate', text: 'Review current run with legal and planning inputs before commitment.' });
  }

  if (missingInputs.length > 0) {
    items.push({ phase: 'Due diligence', text: `Complete missing inputs: ${missingInputs.join(', ')}.` });
  } else {
    items.push({ phase: 'Due diligence', text: 'Validate zoning and title evidence against municipality records.' });
  }

  if ((developerFit || '').toUpperCase().includes('LOW')) {
    items.push({ phase: 'Developer strategy', text: 'Reassess development program and infrastructure prerequisites before acquisition.' });
  } else {
    items.push({ phase: 'Developer strategy', text: 'Prepare phased strategy aligned with parcel readiness and liquidity profile.' });
  }

  const highRisk = risks.find((r) => r.startsWith('HIGH:'));
  if (highRisk) {
    items.push({ phase: 'Valuation warning', text: highRisk.replace('HIGH:', '').trim() });
  } else if ((marketPosition || '').toUpperCase().includes('STRETCHED')) {
    items.push({ phase: 'Valuation warning', text: 'Pricing appears stretched versus local comparables.' });
  } else {
    items.push({ phase: 'Valuation warning', text: 'Track valuation drift against new comparable evidence.' });
  }

  return items;
}

export function RecommendationTimeline(props: RecommendationTimelineProps) {
  const timeline = buildTimeline(props);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Recommendation Timeline</h3>
      <div className="mt-4 space-y-3">
        {timeline.map((item, index) => (
          <div key={`${item.phase}-${index}`} className="flex gap-3">
            <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-600" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.phase}</div>
              <p className="text-sm text-slate-700">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
