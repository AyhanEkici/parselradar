import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminToolbar,
} from '../components/admin';

interface LedgerEntry {
  _id: string;
  userId:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
      };
  amount: number;
  type: string;
  reason: string;
  createdAt: string;
}

function shortenId(value?: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function renderUserIdentity(userId: LedgerEntry['userId']) {
  if (typeof userId === 'string') {
    return <span title={userId}>{shortenId(userId)}</span>;
  }

  const name = userId?.name?.trim();
  const email = userId?.email?.trim();
  const rawId = userId?._id;

  if (name || email) {
    return (
      <div className="leading-5">
        <div className="font-medium text-slate-900">{name || email}</div>
        <div className="text-xs text-slate-500">{email && name ? email : shortenId(rawId)}</div>
      </div>
    );
  }

  return <span title={rawId}>{shortenId(rawId)}</span>;
}

export default function AdminCreditLedger() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function fetchLedger() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    apiFetch(`/admin/credit-ledger?${params.toString()}`)
      .then((data) => {
        setLedger(data.ledger);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Hata');
        setLoading(false);
      });
  }

  useEffect(() => { fetchLedger(); /* eslint-disable-next-line */ }, [page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminPage>
      <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Kredi Defteri"
          subtitle="Kredi hareketlerini, kullanıcı bazında giriş ve çıkışlarıyla inceleyin"
        />

        <AdminTableWrap>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Tutar</AdminTh>
                <AdminTh>Tip</AdminTh>
                <AdminTh>Sebep</AdminTh>
                <AdminTh>Kullanıcı</AdminTh>
                <AdminTh>Oluşturulma</AdminTh>
              </tr>
            </thead>
            <tbody>
              {!loading && ledger.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                  <AdminTd>
                    <span
                      className={`inline-flex min-w-[4.5rem] justify-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        l.amount > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {l.amount > 0 ? '+' : ''}
                      {l.amount}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusPill tone="info">{l.type}</AdminStatusPill>
                  </AdminTd>
                  <AdminTd className="break-words">{l.reason}</AdminTd>
                  <AdminTd className="break-words">{renderUserIdentity(l.userId)}</AdminTd>
                  <AdminTd className="whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        {loading ? <div className="text-sm text-slate-500">Yükleniyor...</div> : null}
        {!loading && ledger.length === 0 ? (
          <AdminEmptyState>
            Bu sayfada gösterilecek kredi hareketi bulunamadı.
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
  );
}
