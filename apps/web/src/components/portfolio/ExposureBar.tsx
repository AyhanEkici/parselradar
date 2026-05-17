import React from 'react';

type Props = {
  value: number;
  max: number;
  label: string;
};

export default function ExposureBar({ value, max, label }: Props) {
  const ratio = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value.toLocaleString('tr-TR')} TL</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
