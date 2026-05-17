import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import OrganizationMembersTable from '../components/organization/OrganizationMembersTable';
import OrganizationExposureCard from '../components/organization/OrganizationExposureCard';

export default function OrganizationDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const payload = await apiFetch(`organizations/${id}`);
      setData(payload);
    } catch (err: any) {
      setError(err?.error || 'Organization detay yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addMember = async () => {
    if (!id) return;
    const targetUserId = window.prompt('Eklenecek kullanıcı ID');
    const role = window.prompt('Role (OWNER/ADMIN/ANALYST/VIEWER)', 'ANALYST');
    if (!targetUserId || !role) return;
    await apiFetch(`organizations/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, role }),
    });
    await load();
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{data.organization?.name || 'Organization'}</h1>
          <div className="flex gap-2">
            <button onClick={addMember} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add Member
            </button>
            <Link to={`/workspace/${id}/dashboard`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Workspace</Link>
          </div>
        </div>

        <OrganizationExposureCard exposure={data.exposure || {}} />
        <OrganizationMembersTable members={data.members || []} />
      </div>
    </div>
  );
}
