import React from 'react';
import OrganizationRoleBadge from './OrganizationRoleBadge';

type Props = {
  members: any[];
};

export default function OrganizationMembersTable({ members }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-slate-500">No members</td>
            </tr>
          ) : (
            members.map((member: any) => (
              <tr key={member._id} className="border-t">
                <td className="px-3 py-2">{member.userId?.name || '-'}</td>
                <td className="px-3 py-2">{member.userId?.email || '-'}</td>
                <td className="px-3 py-2"><OrganizationRoleBadge role={member.role} /></td>
                <td className="px-3 py-2">{member.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
