import React from 'react';

type Props = { row: any };

export default function SharedPortfolioCard({ row }: Props) {
  const property = row.propertySubmissionId || {};
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{property.addressText || `${property.il || '-'} / ${property.ilce || '-'}`}</div>
      <div className="mt-1 text-xs text-slate-600">Title: {row.title || 'Shared Portfolio'}</div>
      <div className="mt-1 text-xs text-slate-600">Asking: {Number(property.askingPriceTRY || 0).toLocaleString('tr-TR')} TL</div>
      <div className="mt-1 text-xs text-slate-600">Added: {new Date(row.createdAt).toLocaleString()}</div>
    </div>
  );
}
