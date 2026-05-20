import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useToast } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Credits() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user, hydrating } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (hydrating) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoadError(null);
      try {
        const response = await apiFetch('credits');
        if (!cancelled) setCredits(Number(response?.credits || 0));
      } catch (err) {
        if (cancelled) return;
        const apiError = err as { status?: number; error?: string };
        if (apiError?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        setLoadError(apiError?.error || 'Kredi bilgisi yüklenemedi');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hydrating, user, navigate]);

  if (hydrating) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        Oturum doğrulanıyor...
      </div>
    );
  }

  if (!user) return null;

  const handleCheckout = async (amount: number) => {
    setLoading(true);
    const loadingToastId = toast.loading(`Checkout hazırlanıyor (${amount} kredi)...`);
    try {
      const res = await apiFetch('stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ creditAmount: amount }),
      });
      toast.dismiss(loadingToastId);
      toast.success('Stripe checkout sayfasına yönlendiriliyorsunuz');
      window.location.href = res.url;
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDevAdd = async () => {
    setLoading(true);
    const loadingToastId = toast.loading('Kredi ekleniyor...');
    try {
      await apiFetch('credits/dev-add', { method: 'POST', body: JSON.stringify({ amount: 10 }) });
      setCredits(c => c + 10);
      toast.dismiss(loadingToastId);
      toast.success('10 kredi eklendi');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'Dev kredi eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Kredi Yükle</h2>
      <div className="mb-2">Kredi bakiyesi: <b>{credits}</b></div>
      {loadError ? <div className="text-red-600 text-sm mb-2">{loadError}</div> : null}
      <div className="space-x-2 mt-4">
        {[25, 50].map(amount => (
          <button key={amount} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading} onClick={() => handleCheckout(amount)}>{amount} Kredi</button>
        ))}
      </div>
      <div className="mt-4">
        <button className="bg-gray-200 px-4 py-2 rounded" disabled={loading} onClick={handleDevAdd}>Dev Only: 10 Kredi Ekle</button>
      </div>
    </div>
  );
}
