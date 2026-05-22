import React from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';

type CmsModule = {
  name: string;
  status: 'wired' | 'partially wired' | 'not wired yet' | 'future module';
  description: string;
  href?: string;
};

const modules: CmsModule[] = [
  {
    name: 'Users',
    status: 'wired',
    description: 'Manage user accounts and roles.',
    href: '/admin/users',
  },
  {
    name: 'Properties',
    status: 'wired',
    description: 'Browse and manage submitted properties.',
    href: '/admin/properties',
  },
  {
    name: 'Evidence / Documents',
    status: 'partially wired',
    description: 'Open a property first, then manage documents.',
  },
  {
    name: 'Analyses',
    status: 'wired',
    description: 'Review analysis runs and status.',
    href: '/admin/analyses',
  },
  {
    name: 'Credits / Ledger',
    status: 'wired',
    description: 'Inspect credit ledger entries.',
    href: '/admin/credit-ledger',
  },
  {
    name: 'Stripe Sessions',
    status: 'wired',
    description: 'Inspect Stripe checkout/session records.',
    href: '/admin/stripe-sessions',
  },
  {
    name: 'Analytics',
    status: 'wired',
    description: 'View analytics overview cards.',
    href: '/admin/analytics',
  },
  {
    name: 'Connectors',
    status: 'wired',
    description: 'Review connector health and configuration pages.',
    href: '/admin/connectors',
  },
  {
    name: 'Aski & Parselasyon Takip',
    status: 'future module',
    description: 'Coming next.',
  },
  {
    name: 'Content / CMS Pages',
    status: 'future module',
    description: 'Coming next. No CRUD wiring in this phase.',
  },
];

function statusClasses(status: CmsModule['status']) {
  if (status === 'wired') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'partially wired') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'not wired yet') return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-indigo-50 text-indigo-700 border-indigo-200';
}

export default function AdminCms() {
  return (
    <AdminLayout title="Admin CMS">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Admin CMS"
            subtitle="Manage users, properties, evidence, analyses, credits and operational data from one place."
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {modules.map((module) => (
              <section key={module.name} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{module.name}</h3>
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${statusClasses(module.status)}`}>
                    {module.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                {module.href ? (
                  <Link to={module.href} className="mt-3 inline-block text-sm text-blue-700 hover:underline">
                    Open
                  </Link>
                ) : (
                  <span className="mt-3 inline-block text-sm text-slate-500">Not wired yet</span>
                )}
              </section>
            ))}
          </div>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
