import React from 'react';

type RiskMatrixProps = {
  risks?: string[];
};

type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

function parseSeverity(risk: string): { severity: Severity; text: string } {
  if (risk.startsWith('HIGH:')) return { severity: 'HIGH', text: risk.replace('HIGH:', '').trim() };
  if (risk.startsWith('MEDIUM:')) return { severity: 'MEDIUM', text: risk.replace('MEDIUM:', '').trim() };
  if (risk.startsWith('LOW:')) return { severity: 'LOW', text: risk.replace('LOW:', '').trim() };
  return { severity: 'LOW', text: risk };
}

const SEVERITY_TONE: Record<Severity, string> = {
  LOW: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-700',
  HIGH: 'bg-red-50 border-red-200 text-red-700',
};

export function RiskMatrix({ risks = [] }: RiskMatrixProps) {
  if (risks.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Risk Matrix</h3>
        <p className="mt-2 text-sm text-slate-500">No risk items were reported for this run.</p>
      </section>
    );
  }

  const grouped: Record<Severity, string[]> = { LOW: [], MEDIUM: [], HIGH: [] };
  risks.forEach((r) => {
    const parsed = parseSeverity(r);
    grouped[parsed.severity].push(parsed.text);
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Risk Matrix</h3>
      <p className="mt-1 text-xs text-slate-500">Grouped severity with explainable risk chips</p>

      <div className="mt-4 space-y-3">
        {(['HIGH', 'MEDIUM', 'LOW'] as Severity[]).map((severity) => (
          <div key={severity}>
            <div className="mb-2 text-xs font-semibold text-slate-600">{severity}</div>
            {grouped[severity].length === 0 ? (
              <div className="text-xs text-slate-400">No items</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {grouped[severity].map((risk) => (
                  <span key={`${severity}-${risk}`} className={`rounded-full border px-2.5 py-1 text-xs ${SEVERITY_TONE[severity]}`}>
                    {risk}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
