import React, { useEffect, useState } from 'react';
import { logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ConversationalAnalysisIntake, { type ConversationalAnalysisContract } from '../components/ConversationalAnalysisIntake';

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

  const handleCreatePropertyDraft = (payload: ConversationalAnalysisContract) => {
    const params = new URLSearchParams();
    const safePrefill: Record<string, string> = {
      il: payload.il,
      ilce: payload.ilce,
      mahalleOrKoy: payload.mahalle,
      ada: payload.ada,
      parsel: payload.parsel,
      areaM2: payload.areaM2,
      askingPriceTRY: payload.totalPrice,
      ilanUrl: payload.listingUrl,
    };

    Object.entries(safePrefill).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
      }
    });

    navigate(`/properties/new?${params.toString()}`);
  };

  return (
    <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-4 px-4 pb-8">
      <div className="premium-dashboard premium-surface rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Hoşgeldiniz, {user?.name}</h2>
        <div className="mb-2 text-sm text-slate-600">Start with guided intake, then create Yeni Mülk, add evidence, and review the guidance report.</div>
        <div className="mb-2">Kredi bakiyesi: <b>{loadingCredits ? '...' : credits}</b></div>
        {creditsError ? <div className="text-red-600 text-sm mb-2">{creditsError}</div> : null}
        <div className="space-x-2 mt-4">
          <Link to="/properties/new" className="premium-action px-4 py-2 rounded">Yeni Mülk</Link>
          <Link to="/reports" className="premium-outline px-4 py-2 rounded">Raporlarım</Link>
          <Link to="/credits" className="premium-outline px-4 py-2 rounded">Kredi Yükle</Link>
        </div>
        <button className="mt-8 text-red-600 underline" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>Çıkış Yap</button>
      </div>

      <ConversationalAnalysisIntake onCreatePropertyDraft={handleCreatePropertyDraft} />
    </div>
  );
}
