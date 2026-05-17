import React from 'react';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function NotificationPreferenceToggle({ label, checked, onChange }: Props) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-sm text-slate-800">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
