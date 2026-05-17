import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useToast } from '../components/ui';

export default function Credits() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    apiFetch('credits').then(r => setCredits(r.credits));
  }, []);

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
