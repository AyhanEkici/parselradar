import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';

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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stripe Oturumları</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2">SessionId</th>
              <th className="border px-2">Kullanıcı</th>
              <th className="border px-2">Kredi</th>
              <th className="border px-2">Ödenen Tutar</th>
              <th className="border px-2">Durum</th>
              <th className="border px-2">FulfilledAt</th>
              <th className="border px-2">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center">Yükleniyor...</td></tr> : null}
            {!loading && sessions.length === 0 ? <tr><td colSpan={7} className="text-center">Kayıt yok</td></tr> : null}
            {sessions.map(s => {
              const user = typeof s.userId === 'object' ? s.userId : null;
              return (
                <tr key={s._id}>
                  <td className="border px-2">{s.sessionId}</td>
                  <td className="border px-2">{user ? `${user.name} (${user.email})` : s.userId}</td>
                  <td className="border px-2">{s.creditAmount}</td>
                  <td className="border px-2">{s.amountTotal ? `${s.currency || 'USD'} ${s.amountTotal.toFixed(2)}` : '-'}</td>
                  <td className="border px-2">{s.status}</td>
                  <td className="border px-2">{s.fulfilledAt ? new Date(s.fulfilledAt).toLocaleString() : '-'}</td>
                  <td className="border px-2">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
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
