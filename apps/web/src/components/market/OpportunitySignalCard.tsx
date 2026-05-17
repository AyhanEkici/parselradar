import React from 'react';

type OpportunitySignalCardProps = {
  opportunitySignals?: string[];
  overpricingRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
};

function riskTone(risk?: string) {
  const r = (risk || '').toUpperCase();
  if (r === 'LOW') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  if (r === 'MEDIUM') return 'bg-amber-50 border-amber-200 text-amber-800';
  return 'bg-red-50 border-red-200 text-red-800';
}

export function OpportunitySignalCard({ opportunitySignals = [], overpricingRisk = 'LOW' }: OpportunitySignalCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Opportunity Signals</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {opportunitySignals.length > 0 ? (
          opportunitySignals.map((signal) => (
            <span key={signal} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
              {signal}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">No explicit opportunity signal detected.</span>
        )}
      </div>

      <div className={`mt-4 rounded-lg border px-3 py-2 text-xs font-semibold ${riskTone(overpricingRisk)}`}>
        Overpricing risk: {overpricingRisk}
      </div>
    </section>
  );
}
