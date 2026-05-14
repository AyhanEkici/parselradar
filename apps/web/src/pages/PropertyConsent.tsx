import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function PropertyConsent() {
  const { id } = useParams();
  const [form, setForm] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.termsAccepted || !form.privacyAccepted) {
      setError('Açık rıza ve gizlilik zorunlu.');
      return;
    }
    try {
      await apiFetch(`properties/${id}/consent`, { method: 'POST', body: JSON.stringify(form) });
      navigate(`/properties/${id}/result`);
    } catch (err) {
      setError((err as { error?: string }).error || 'Kayıt başarısız');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Açık Rıza ve Onaylar</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block"><input type="checkbox" name="termsAccepted" onChange={handleChange} /> Kullanım koşullarını kabul ediyorum *</label>
        <label className="block"><input type="checkbox" name="privacyAccepted" onChange={handleChange} /> Gizlilik politikasını kabul ediyorum *</label>
        <label className="block"><input type="checkbox" name="allowAnonymizedMarketAnalytics" onChange={handleChange} /> Anonim analizlere katkı</label>
        <label className="block"><input type="checkbox" name="allowDealPoolEvaluation" onChange={handleChange} /> Deal Pool değerlendirmesine katıl</label>
        <label className="block"><input type="checkbox" name="allowContactForMatching" onChange={handleChange} /> Eşleşme için iletişime izin ver</label>
        <label className="block"><input type="checkbox" name="allowShareWithLicensedAgents" onChange={handleChange} /> Lisanslı emlakçılarla paylaş</label>
        <label className="block"><input type="checkbox" name="allowShareWithDevelopersContractors" onChange={handleChange} /> Müteahhitlerle paylaş</label>
        <div className="text-xs text-gray-600 mt-2">Deal Pool değerlendirmesi yalnızca ayrı onayla yapılır.</div>
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Kaydet ve Sonuç</button>
      </form>
    </div>
  );
}
