import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';

interface Analysis {
  _id: string;
  userId: string;
  propertySubmissionId: string;
  score: number;
  signal: string;
  reused: boolean;
  createdAt: string;
}

export default function AdminAnalyses() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function fetchAnalyses() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    apiFetch(`/admin/analyses?${params.toString()}`)
      .then((data) => {
        setAnalyses(data.analyses);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Hata');
        setLoading(false);
      });
  }

  useEffect(() => { fetchAnalyses(); /* eslint-disable-next-line */ }, [page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Analizler</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2">Score</th>
              <th className="border px-2">Signal</th>
              <th className="border px-2">Reused</th>
              <th className="border px-2">Property</th>
              <th className="border px-2">User</th>
              <th className="border px-2">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center">Yükleniyor...</td></tr> : null}
            {!loading && analyses.length === 0 ? <tr><td colSpan={6} className="text-center">Kayıt yok</td></tr> : null}
            {analyses.map(a => (
              <tr key={a._id}>
                <td className="border px-2">{a.score}</td>
                <td className="border px-2">{a.signal}</td>
                <td className="border px-2">{a.reused ? 'Evet' : 'Hayır'}</td>
                <td className="border px-2">{a.propertySubmissionId}</td>
                <td className="border px-2">{a.userId}</td>
                <td className="border px-2">{new Date(a.createdAt).toLocaleString()}</td>
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
