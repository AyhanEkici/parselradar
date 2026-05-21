import React, { useEffect, useState } from 'react';
import { logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import UserScopedNotice from '../components/UserScopedNotice';
import { useAuth } from '../hooks/useAuth';
import { hasAuthSession } from '../lib/authStorage';

export default function Dashboard() {
  const [credits, setCredits] = useState<number>(0);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const { user, hydrating, authState } = useAuth();
  const navigate = useNavigate();
  const hasSession = hasAuthSession();

  useEffect(() => {
    if (hydrating) return;
    if (!user && !hasSession && authState !== 'authenticating' && authState !== 'booting') {
      navigate('/login', { replace: true });
      return;
    }

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
  }, [hydrating, user, hasSession, authState, navigate]);

  if (hydrating || (!user && hasSession)) {
    return (
      <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
        Oturum doğrulanıyor...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Hoşgeldiniz, {user?.name}</h2>
      <UserScopedNotice />
      <div className="mb-2">Kredi bakiyesi: <b>{loadingCredits ? '...' : credits}</b></div>
      {creditsError ? <div className="text-red-600 text-sm mb-2">{creditsError}</div> : null}
      <div className="space-x-2 mt-4">
        <a href="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded">Yeni Mülk</a>
        <a href="/reports" className="bg-gray-200 px-4 py-2 rounded">Raporlarım</a>
        <a href="/credits" className="bg-gray-200 px-4 py-2 rounded">Kredi Yükle</a>
      </div>
      <button className="mt-8 text-red-600 underline" onClick={() => { logout(); navigate('/login', { replace: true }); }}>Çıkış Yap</button>
    </div>
  );
}
