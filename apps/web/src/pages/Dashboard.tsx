import React, { useEffect, useState } from 'react';
import { logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const [credits, setCredits] = useState<number>(0);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const run = async () => {
      setLoadingCredits(true);
      setCreditsError(null);
      try {
        const response = await apiFetch('credits');
        if (!cancelled) {
          setCredits(Number(response?.credits || 0));
        }
      } catch (err) {
        if (cancelled) return;
        const apiError = err as { status?: number; error?: string };
        if (apiError?.status === 401) {
          setCreditsError('Oturum doğrulaması geçici olarak başarısız. Lütfen sayfayı yenileyin.');
          return;
        }
        setCreditsError(apiError?.error || 'Kredi bilgisi yüklenemedi');
      } finally {
        if (!cancelled) setLoadingCredits(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Hoşgeldiniz, {user?.name}</h2>
      <div className="mb-2 text-sm text-slate-600">Showing only your own submitted properties and reports.</div>
      <div className="mb-2">Kredi bakiyesi: <b>{loadingCredits ? '...' : credits}</b></div>
      {creditsError ? <div className="text-red-600 text-sm mb-2">{creditsError}</div> : null}
      <div className="space-x-2 mt-4">
        <Link to="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded">Yeni Mülk</Link>
        <Link to="/reports" className="bg-gray-200 px-4 py-2 rounded">Raporlarım</Link>
        <Link to="/credits" className="bg-gray-200 px-4 py-2 rounded">Kredi Yükle</Link>
      </div>
      <button className="mt-8 text-red-600 underline" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>Çıkış Yap</button>
    </div>
  );
}
