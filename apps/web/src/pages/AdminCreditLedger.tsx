import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';

interface LedgerEntry {
  _id: string;
  userId: string;
  amount: number;
  type: string;
  reason: string;
  createdAt: string;
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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kredi Defteri</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2">Tutar</th>
              <th className="border px-2">Tip</th>
              <th className="border px-2">Sebep</th>
              <th className="border px-2">Kullanıcı</th>
              <th className="border px-2">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center">Yükleniyor...</td></tr> : null}
            {!loading && ledger.length === 0 ? <tr><td colSpan={5} className="text-center">Kayıt yok</td></tr> : null}
            {ledger.map(l => (
              <tr key={l._id}>
                <td className={`border px-2 ${l.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{l.amount > 0 ? '+' : ''}{l.amount}</td>
                <td className="border px-2">{l.type}</td>
                <td className="border px-2">{l.reason}</td>
                <td className="border px-2">{l.userId}</td>
                <td className="border px-2">{new Date(l.createdAt).toLocaleString()}</td>
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
