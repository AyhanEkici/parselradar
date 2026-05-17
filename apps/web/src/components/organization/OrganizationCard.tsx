import React from 'react';
import { Link } from 'react-router-dom';
import OrganizationRoleBadge from './OrganizationRoleBadge';

type Props = {
  organization: any;
};

export default function OrganizationCard({ organization }: Props) {
  return (
    <Link
      to={`/organizations/${organization._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">{organization.name}</div>
          <div className="mt-1 text-xs text-slate-600">Members: {organization.memberCount || 0}</div>
          <div className="text-xs text-slate-600">Shared analyses: {organization.sharedAnalysesCount || 0}</div>
        </div>
        <OrganizationRoleBadge role={organization.memberRole || 'VIEWER'} />
      </div>
    </Link>
  );
}
