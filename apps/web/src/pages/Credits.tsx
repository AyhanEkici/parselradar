import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function Credits() {
  const [credits, setCredits] = useState<number>(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('credits').then(r => setCredits(r.credits));
  }, []);

  const handleCheckout = async (amount: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ creditAmount: amount }),
      });
      window.location.href = res.url;
    } catch (err) {
      setError((err as { error?: string }).error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDevAdd = async () => {
    setLoading(true);
    setError('');
    try {
      await apiFetch('credits/dev-add', { method: 'POST', body: JSON.stringify({ amount: 10 }) });
      setCredits(c => c + 10);
    } catch (err) {
      setError((err as { error?: string }).error || 'Dev kredi eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Kredi Yükle</h2>
      <div className="mb-2">Kredi bakiyesi: <b>{credits}</b></div>
      <div className="space-x-2 mt-4">
        {[5, 10, 25, 50].map(amount => (
          <button key={amount} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading} onClick={() => handleCheckout(amount)}>{amount} Kredi</button>
        ))}
      </div>
      <div className="mt-4">
        <button className="bg-gray-200 px-4 py-2 rounded" disabled={loading} onClick={handleDevAdd}>Dev Only: 10 Kredi Ekle</button>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
