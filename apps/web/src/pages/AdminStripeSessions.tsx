import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminLayout,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminToolbar,
} from '../components/admin';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface StripeSession {
  _id: string;
  sessionId: string;
  userId: User | string;
  creditAmount: number;
  amountTotal?: number;
  currency?: string;
  status: string;
  fulfilledAt?: string;
  createdAt: string;
}

function shortenId(value?: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  const normalized = status.toUpperCase();
  if (normalized === 'PAID') return 'success';
  if (normalized === 'PENDING') return 'warning';
  if (normalized === 'FAILED' || normalized === 'CANCELED') return 'danger';
  return 'info';
}

function renderUserIdentity(userId: StripeSession['userId']) {
  if (typeof userId === 'string') {
    return <span title={userId}>{shortenId(userId)}</span>;
  }

  const name = userId?.name?.trim();
  const email = userId?.email?.trim();

  if (name || email) {
    return (
      <div className="leading-5">
        <div className="font-medium text-slate-900">{name || email}</div>
        {email && name ? <div className="text-xs text-slate-500">{email}</div> : null}
      </div>
    );
  }

  return <span title={userId?._id}>{shortenId(userId?._id)}</span>;
}

export default function AdminStripeSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StripeSession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function fetchSessions() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    apiFetch(`/admin/stripe-sessions?${params.toString()}`)
      .then((data) => {
        setSessions(data.sessions);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Hata');
        setLoading(false);
      });
  }

  useEffect(() => { fetchSessions(); /* eslint-disable-next-line */ }, [page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Stripe Sessions">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Stripe Oturumları"
          subtitle="Ödeme oturumlarını durum, kullanıcı ve kredi karşılığıyla görüntüleyin"
        />

        <AdminTableWrap>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>SessionId</AdminTh>
                <AdminTh>Kullanıcı</AdminTh>
                <AdminTh>Kredi</AdminTh>
                <AdminTh>Ödenen Tutar</AdminTh>
                <AdminTh>Durum</AdminTh>
                <AdminTh>FulfilledAt</AdminTh>
                <AdminTh>Oluşturulma</AdminTh>
              </tr>
            </thead>
            <tbody>
              {!loading && sessions.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                  <AdminTd className="font-mono text-xs break-all" title={s.sessionId}>
                    {shortenId(s.sessionId)}
                  </AdminTd>
                  <AdminTd className="break-words">{renderUserIdentity(s.userId)}</AdminTd>
                  <AdminTd>
                    <span className="inline-flex min-w-[3.5rem] justify-center rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                      {s.creditAmount}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {typeof s.amountTotal === 'number' ? `${s.currency || 'USD'} ${s.amountTotal.toFixed(2)}` : '-'}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusPill tone={statusTone(s.status)}>{s.status}</AdminStatusPill>
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap">
                    {s.fulfilledAt ? new Date(s.fulfilledAt).toLocaleString() : '-'}
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        {loading ? <div className="text-sm text-slate-500">Yükleniyor...</div> : null}
        {!loading && sessions.length === 0 ? (
          <AdminEmptyState>
            Bu sayfada gösterilecek Stripe oturumu bulunamadı.
          </AdminEmptyState>
        ) : null}

        <AdminToolbar className="justify-between">
          <div className="text-sm text-slate-600">Sayfa {page} / {totalPages}</div>
          <div className="flex items-center gap-2">
            <AdminButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Önceki
            </AdminButton>
            <AdminButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sonraki
            </AdminButton>
          </div>
        </AdminToolbar>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
