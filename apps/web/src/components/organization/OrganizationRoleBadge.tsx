import React from 'react';

type Props = {
  role: 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER' | string;
};

export default function OrganizationRoleBadge({ role }: Props) {
  const tone =
    role === 'OWNER'
      ? 'bg-slate-900 text-white'
      : role === 'ADMIN'
      ? 'bg-blue-600 text-white'
      : role === 'ANALYST'
      ? 'bg-emerald-600 text-white'
      : 'bg-slate-200 text-slate-800';

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{role}</span>;
}
