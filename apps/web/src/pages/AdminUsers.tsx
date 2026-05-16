import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';

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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kullanıcılar</h1>
      <div className="mb-2 flex gap-2 items-center">
        <input className="border px-2 py-1 text-xs" placeholder="Ara (email, isim)" value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} />
        <select className="border px-2 py-1 text-xs" value={role} onChange={e => { setPage(1); setRole(e.target.value); }}>
          <option value="">Tüm Roller</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button className="border px-2 py-1 text-xs" onClick={() => { setSearch(''); setRole(''); setPage(1); }}>Temizle</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2">Email</th>
              <th className="border px-2">İsim</th>
              <th className="border px-2">Rol</th>
              <th className="border px-2">Kredi</th>
              <th className="border px-2">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center">Yükleniyor...</td></tr> : null}
            {!loading && users.length === 0 ? <tr><td colSpan={5} className="text-center">Kayıt yok</td></tr> : null}
            {users.map(u => (
              <tr key={u._id}>
                <td className="border px-2">{u.email}</td>
                <td className="border px-2">{u.name}</td>
                <td className="border px-2"><span className={`px-2 py-1 rounded text-white ${u.role === 'ADMIN' ? 'bg-blue-600' : 'bg-gray-500'}`}>{u.role}</span></td>
                <td className="border px-2">{u.credits ?? '-'}</td>
                <td className="border px-2">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-2 justify-center">
        <button className="border px-2 py-1 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Önceki</button>
        <span>Sayfa {page} / {totalPages}</span>
        <button className="border px-2 py-1 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</button>
      </div>
    </div>
  );
}
