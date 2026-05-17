import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminInput,
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

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    params.append('page', String(page));
    apiFetch(`/admin/users?${params.toString()}`)
      .then((data) => {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Hata');
        setLoading(false);
      });
  }

  useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [search, role, page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminPage>
      <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Kullanıcılar"
          subtitle="Tüm kullanıcıları filtreleyin, rollerini inceleyin ve kredi durumunu takip edin"
        />

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
                    <AdminStatusPill tone={u.role === 'ADMIN' ? 'info' : 'neutral'}>{u.role}</AdminStatusPill>
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
  );
}
