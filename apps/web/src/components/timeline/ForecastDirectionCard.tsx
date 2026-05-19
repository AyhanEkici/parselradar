import React from 'react';

export default function ForecastDirectionCard({ forecast }: { forecast?: { direction?: string; forecastScore?: number; pressureScore?: number; municipalityScore?: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Forecast Direction</h3>
      <p className="mt-1 text-xs text-slate-700">Direction: {forecast?.direction || '-'}</p>
      <p className="text-xs text-slate-700">Forecast: {forecast?.forecastScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Pressure: {forecast?.pressureScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Municipal: {forecast?.municipalityScore ?? '-'}</p>
    </div>
  );
}
