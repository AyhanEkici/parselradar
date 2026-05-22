import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';

type CmsModule = {
  area: string;
  status: 'wired' | 'partial' | 'not wired yet' | 'future';
  description: string;
  href?: string;
  actionLabel?: string;
};

const modules: CmsModule[] = [
  {
    area: 'Users',
    status: 'wired',
    description: 'Manage user roles/status and user-level admin visibility.',
    href: '/admin/users',
  },
  {
    area: 'Properties',
    status: 'wired',
    description: 'Manage all submitted properties.',
    href: '/admin/properties',
    actionLabel: 'Open Properties',
  },
  {
    area: 'Evidence / Documents',
    status: 'partial',
    description: 'Partial but usable: open a property first, then manage documents/evidence.',
    href: '/admin/properties',
    actionLabel: 'Open Properties to manage evidence',
  },
  {
    area: 'Analyses',
    status: 'wired',
    description: 'Analysis visibility is linked to individual properties and global admin analysis view.',
    href: '/admin/properties',
    actionLabel: 'Open Properties for analysis/result flow',
  },
  {
    area: 'Credits / Ledger',
    status: 'wired',
    description: 'Inspect credit balances and ledger history.',
    href: '/admin/credit-ledger',
  },
  {
    area: 'Stripe Sessions',
    status: 'wired',
    description: 'Inspect payment session lifecycle and outcomes.',
    href: '/admin/stripe-sessions',
  },
  {
    area: 'Analytics',
    status: 'wired',
    description: 'View analytics overview and product/runtime cards.',
    href: '/admin/analytics',
  },
  {
    area: 'Connectors',
    status: 'wired',
    description: 'Diagnostic/governance only. Not activated data automation.',
    href: '/admin/connectors',
  },
  {
    area: 'Aski & Parselasyon Takip',
    status: 'future',
    description: 'Future public-source monitor for CSB/TKGM e-ilan and belediye aski sources.',
  },
  {
    area: 'Content / CMS Pages',
    status: 'future',
    description: 'Future managed content/pages module. No CRUD in this phase.',
  },
];

function statusClasses(status: CmsModule['status']) {
  if (status === 'wired') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'partial') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'not wired yet') return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-indigo-50 text-indigo-700 border-indigo-200';
}

function statusLabel(status: CmsModule['status']) {
  if (status === 'wired') return 'Wired';
  if (status === 'partial') return 'Partial';
  if (status === 'not wired yet') return 'Not wired yet';
  return 'Future';
}

export default function AdminCms() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [propertiesCount, setPropertiesCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const usersResponse = await apiFetch('/admin/users?page=1');
        if (cancelled) return;
        if (Array.isArray(usersResponse?.users)) {
          const totalPages = Number(usersResponse?.totalPages || 1);
          const pageSize = usersResponse.users.length;
          setUsersCount(totalPages > 1 && pageSize > 0 ? null : pageSize);
        }
      } catch {
        if (!cancelled) setUsersCount(null);
      }

      try {
        const propertiesResponse = await apiFetch('/admin/properties');
        if (cancelled) return;
        if (Array.isArray(propertiesResponse)) {
          setPropertiesCount(propertiesResponse.length);
        }
      } catch {
        if (!cancelled) setPropertiesCount(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return modules.map((module) => {
      let preview = '-';
      if (module.area === 'Users' && usersCount !== null) preview = `${usersCount} loaded (first page)`;
      if (module.area === 'Properties' && propertiesCount !== null) preview = `${propertiesCount} loaded`;
      return { ...module, preview };
    });
  }, [usersCount, propertiesCount]);

  return (
    <AdminLayout title="Admin CMS">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Admin CMS"
            subtitle="Management overview for wired admin routes and upcoming CMS modules."
            actions={
              <div className="flex flex-wrap gap-2 text-sm">
                <Link to="/admin/audit-timeline" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Back to Admin Panel
                </Link>
                <Link to="/dashboard" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Back to Dashboard
                </Link>
              </div>
            }
          />

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Property Operations</h3>
            <p className="mt-1 text-sm text-slate-600">
              Current evidence and result management is property-scoped. There is no standalone global evidence module yet.
            </p>
            <ol className="mt-3 list-decimal pl-5 text-sm text-slate-700 space-y-1">
              <li>Open CMS</li>
              <li>Open Properties</li>
              <li>Select property</li>
              <li>Open Documents/Evidence</li>
              <li>Review analysis/result</li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/admin/properties" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                Open Properties
              </Link>
            </div>
          </section>

          <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Area</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-left font-semibold">Route</th>
                  <th className="px-3 py-2 text-left font-semibold">Preview</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((module) => (
                  <tr key={module.area} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="px-3 py-2 font-medium text-slate-900">{module.area}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${statusClasses(module.status)}`}>
                        {statusLabel(module.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{module.description}</td>
                    <td className="px-3 py-2">
                      {module.href ? (
                        <Link to={module.href} className="text-blue-700 hover:underline">
                          {module.actionLabel || module.href}
                        </Link>
                      ) : (
                        <span className="text-slate-500">Not wired yet</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{module.preview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
