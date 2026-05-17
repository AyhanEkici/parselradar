import React from 'react';
import { PropertyContext } from './types';

type AnalysisFactorsGridProps = {
  property: PropertyContext;
  documentCount: number;
  factorsUsed?: Record<string, unknown>;
};

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fmtNumber(value?: number, suffix = '') {
  return typeof value === 'number' ? `${value.toLocaleString('tr-TR')}${suffix}` : '-';
}

export function AnalysisFactorsGrid({ property, documentCount, factorsUsed }: AnalysisFactorsGridProps) {
  const comparable = getNumber(factorsUsed?.comparablePricePerM2);
  const subject = getNumber(factorsUsed?.subjectPricePerM2);
  const districtMultiplier = getNumber(factorsUsed?.districtMultiplier);

  const items = [
    { label: 'Parcel size', value: fmtNumber(property.areaM2, ' m²') },
    { label: 'Zoning', value: property.zoningStatus || '-' },
    { label: 'Infrastructure', value: property.roadAccess || '-' },
    { label: 'Utilities', value: `E: ${property.electricity || '-'} / W: ${property.water || '-'}` },
    { label: 'Document count', value: String(documentCount) },
    { label: 'District multiplier', value: districtMultiplier != null ? districtMultiplier.toFixed(2) : '-' },
    {
      label: 'Comparable pricing',
      value: comparable != null && subject != null
        ? `Comp ${fmtNumber(comparable, ' TL/m²')} · Subject ${fmtNumber(subject, ' TL/m²')}`
        : '-',
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Analysis Factors Grid</h3>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 break-words">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
