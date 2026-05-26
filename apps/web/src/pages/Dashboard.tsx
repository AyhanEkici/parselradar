import React, { useEffect, useState } from 'react';
import { logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const [credits, setCredits] = useState<number>(0);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Intake form state
  const [form, setForm] = useState({
    il: '',
    ilce: '',
    mahalleOrKoy: '',
    areaM2: '',
    askingPriceTRY: '',
    ada: '',
    parsel: '',
    baslik: '',
    kategori: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return null;
  }

  const inputClass = (name: string) =>
    `w-full border p-2 rounded ${fieldErrors[name] ? 'border-red-500' : 'border-gray-300'}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});
    // Minimal required fields
    const required = ['il', 'ilce', 'mahalleOrKoy', 'areaM2', 'askingPriceTRY', 'ada', 'parsel'];
    const errors: Record<string, string> = {};
    required.forEach((key) => {
      if (!form[key] || !String(form[key]).trim()) {
        errors[key] = 'Gerekli';
      }
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError('Lütfen gerekli alanları doldurun.');
      return;
    }
    setSubmitting(true);
    try {
      // Use safe property creation flow (minimal payload)
      const payload = {
        il: form.il.trim(),
        ilce: form.ilce.trim(),
        mahalleOrKoy: form.mahalleOrKoy.trim(),
        areaM2: form.areaM2.trim(),
        askingPriceTRY: form.askingPriceTRY.trim(),
        ada: form.ada.trim(),
        parsel: form.parsel.trim(),
        baslik: form.baslik.trim(),
        kategori: form.kategori.trim(),
      };
      const property = await apiFetch('properties', { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/properties/${property._id}/documents`);
    } catch (err) {
      const apiError = err as { error?: string; fields?: Record<string, string> };
      setSubmitError(apiError.error || 'Doğrulama hatası oluştu.');
      setFieldErrors(apiError.fields || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-4 px-4 pb-8">
      <div className="premium-dashboard premium-surface rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Hoşgeldiniz, {user?.name}</h2>
        <div className="mb-2 text-sm text-slate-600">Yeni Mülk kaydı ile başlayın, ardından kaynakları yükleyin ve rehber raporu inceleyin.</div>
        <div className="mb-2">Kredi bakiyesi: <b>{loadingCredits ? '...' : credits}</b></div>
        {creditsError ? <div className="text-red-600 text-sm mb-2">{creditsError}</div> : null}
        <div className="space-x-2 mt-4">
          <Link to="/reports" className="premium-outline px-4 py-2 rounded">Raporlarım</Link>
          <Link to="/credits" className="premium-outline px-4 py-2 rounded">Kredi Yükle</Link>
        </div>
        <button className="mt-8 text-red-600 underline" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>Çıkış Yap</button>
      </div>

      {/* New property intake card */}
      <form className="premium-dashboard premium-surface rounded shadow p-6 mt-4" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-2">Yeni Mülk Kaydı</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location dropdown pilot: Kayseri > Melikgazi > Gesi Cumhuriyet */}
          <div>
            <label className="block text-sm font-medium">İl *</label>
            <select className={inputClass('il')} name="il" value={form.il} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              <option value="Kayseri">Kayseri</option>
            </select>
            {fieldErrors.il && <div className="text-sm text-red-600">{fieldErrors.il}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">İlçe *</label>
            <select className={inputClass('ilce')} name="ilce" value={form.ilce} onChange={handleChange} disabled={!form.il}>
              <option value="">Seçiniz...</option>
              {form.il === 'Kayseri' && <option value="Melikgazi">Melikgazi</option>}
            </select>
            {fieldErrors.ilce && <div className="text-sm text-red-600">{fieldErrors.ilce}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Mahalle/Köy *</label>
            <select className={inputClass('mahalleOrKoy')} name="mahalleOrKoy" value={form.mahalleOrKoy} onChange={handleChange} disabled={!form.ilce}>
              <option value="">Seçiniz...</option>
              {form.ilce === 'Melikgazi' && <option value="Gesi Cumhuriyet">Gesi Cumhuriyet</option>}
            </select>
            {fieldErrors.mahalleOrKoy && <div className="text-sm text-red-600">{fieldErrors.mahalleOrKoy}</div>}
            {/* Manual fallback for other locations */}
            <div className="mt-1 text-xs text-slate-500">Diğer il/ilçe/mahalle için elle yazın:</div>
            <input className={inputClass('mahalleOrKoy')} name="mahalleOrKoy" placeholder="Manuel mahalle/köy" value={form.mahalleOrKoy} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium">Ada *</label>
            <input className={inputClass('ada')} name="ada" value={form.ada} onChange={handleChange} />
            {fieldErrors.ada && <div className="text-sm text-red-600">{fieldErrors.ada}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Parsel *</label>
            <input className={inputClass('parsel')} name="parsel" value={form.parsel} onChange={handleChange} />
            {fieldErrors.parsel && <div className="text-sm text-red-600">{fieldErrors.parsel}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Alan (m²) *</label>
            <input className={inputClass('areaM2')} name="areaM2" value={form.areaM2} onChange={handleChange} />
            {fieldErrors.areaM2 && <div className="text-sm text-red-600">{fieldErrors.areaM2}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Fiyat (TL) *</label>
            <input className={inputClass('askingPriceTRY')} name="askingPriceTRY" value={form.askingPriceTRY} onChange={handleChange} />
            {fieldErrors.askingPriceTRY && <div className="text-sm text-red-600">{fieldErrors.askingPriceTRY}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium">Başlık (opsiyonel)</label>
            <input className={inputClass('baslik')} name="baslik" value={form.baslik} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium">Kategori (opsiyonel)</label>
            <input className={inputClass('kategori')} name="kategori" value={form.kategori} onChange={handleChange} />
          </div>
        </div>
        {submitError && <div className="text-red-600 mt-2">{submitError}</div>}
        <button
          type="submit"
          className="mt-4 bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:bg-blue-300"
          disabled={submitting}
        >
          Mülkü kaydet ve kaynakları kontrol et
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
