import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminInput,
  AdminLayout,
  AdminPage,
  AdminSelect,
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
  email: string;
  name: string;
  role: string;
  createdAt: string;
  credits?: number;
}

type EmailDeliveryState = {
  state: 'EMAIL_NOT_CONFIGURED' | 'EMAIL_CONFIGURED' | 'EMAIL_SENT' | 'EMAIL_FAILED' | string;
  configured: boolean;
  provider?: string;
  diagnosis?: string;
};

export default function AdminUsers() {
  const { user, hydrating, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, 'USER' | 'ADMIN'>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [emailDeliveryState, setEmailDeliveryState] = useState<EmailDeliveryState | null>(null);

  function fetchUsers() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    params.append('page', String(page));
    apiFetch(`/admin/users?${params.toString()}`)
      .then((data) => {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        const nextPending: Record<string, 'USER' | 'ADMIN'> = {};
        for (const u of data.users || []) {
          const normalizedRole = String(u.role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
          nextPending[u._id] = normalizedRole;
        }
        setPendingRoles(nextPending);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.error || e.message || 'Hata');
        setLoading(false);
      });
  }

  function fetchEmailDeliveryState() {
    apiFetch('/admin/email-delivery-state')
      .then((data) => setEmailDeliveryState(data as EmailDeliveryState))
      .catch(() => setEmailDeliveryState(null));
  }

  async function saveRole(targetUserId: string) {
    const nextRole = pendingRoles[targetUserId];
    if (!nextRole) return;
    setSavingUserId(targetUserId);
    setStatusMessage('');
    try {
      const response = await apiFetch(`/admin/users/${targetUserId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });

      const updated = response?.user as User | undefined;
      if (updated) {
        setUsers((prev) => prev.map((u) => (u._id === targetUserId ? { ...u, role: updated.role } : u)));
      }
      setStatusMessage(response?.message || 'Rol güncellendi');
    } catch (e) {
      const err = e as { error?: string; message?: string };
      setStatusMessage(err.error || err.message || 'Rol güncellenemedi');
    } finally {
      setSavingUserId(null);
    }
  }

  useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [search, role, page]);
  useEffect(() => { fetchEmailDeliveryState(); }, []);

  if (hydrating) return <div>Oturum doğrulanıyor...</div>;

  if (!user || !isAdmin) return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Users">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Kullanıcılar"
          subtitle="Kullanıcıları filtreleyin, rollerini güncelleyin ve e-posta teslim durumunu yönetin"
        />

        {emailDeliveryState ? (
          <div className={`rounded border px-3 py-2 text-sm ${emailDeliveryState.state === 'EMAIL_NOT_CONFIGURED' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`}>
            <strong>Password reset e-mail:</strong> {emailDeliveryState.state}
            {emailDeliveryState.state === 'EMAIL_NOT_CONFIGURED' ? ' - SMTP yapılandırması eksik.' : ' - SMTP yapılandırması hazır.'}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {statusMessage}
          </div>
        ) : null}

        <AdminToolbar>
          <AdminInput
            className="w-full sm:w-72"
            placeholder="Ara (email, isim)"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <AdminSelect
            className="w-full sm:w-44"
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
          >
            <option value="">Tüm Roller</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </AdminSelect>
          <AdminButton
            onClick={() => {
              setSearch('');
              setRole('');
              setPage(1);
            }}
          >
            Temizle
          </AdminButton>
        </AdminToolbar>

        <AdminTableWrap>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Email</AdminTh>
                <AdminTh>İsim</AdminTh>
                <AdminTh>Rol</AdminTh>
                <AdminTh>Rol Yönetimi</AdminTh>
                <AdminTh>Kredi</AdminTh>
                <AdminTh>Oluşturulma</AdminTh>
              </tr>
            </thead>
            <tbody>
              {!loading && users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <AdminTd className="font-medium text-slate-900 break-all">{u.email}</AdminTd>
                  <AdminTd className="break-words">{u.name}</AdminTd>
                  <AdminTd>
                    <AdminStatusPill tone={String(u.role || '').toUpperCase() === 'ADMIN' ? 'info' : 'neutral'}>{String(u.role || '').toUpperCase()}</AdminStatusPill>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-2">
                      <AdminSelect
                        value={pendingRoles[u._id] || (String(u.role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER')}
                        onChange={(e) => {
                          const nextRole = String(e.target.value || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
                          setPendingRoles((prev) => ({ ...prev, [u._id]: nextRole }));
                        }}
                        disabled={savingUserId === u._id}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </AdminSelect>
                      <AdminButton
                        onClick={() => saveRole(u._id)}
                        disabled={savingUserId === u._id || (pendingRoles[u._id] || (String(u.role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER')) === (String(u.role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER')}
                      >
                        {savingUserId === u._id ? 'Kaydediliyor...' : 'Kaydet'}
                      </AdminButton>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <span className="inline-flex min-w-[3rem] justify-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {u.credits ?? '-'}
                    </span>
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap">{new Date(u.createdAt).toLocaleString()}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        {loading ? <div className="text-sm text-slate-500">Yükleniyor...</div> : null}
        {!loading && users.length === 0 ? <AdminEmptyState>Kayıt yok</AdminEmptyState> : null}

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
