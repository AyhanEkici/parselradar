
import React, { useEffect, useState } from 'react';
import { logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getProvinceOptions,
  getDistrictOptions,
  getNeighborhoodOptions,
  getLocationCoverageStatus
} from '../lib/locationOptions';
  const locationStatus = getLocationCoverageStatus();

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
    assetType: 'ARSA',
    inputMethod: 'ADA_PARSEL',
    tapuType: 'MUSTAKIL',
    zoningStatus: 'IMARLI',
    roadAccess: 'KADASTRO_YOLU',
    electricity: 'VAR',
    water: 'VAR',
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
    const required = ['il', 'ilce', 'mahalleOrKoy', 'areaM2', 'askingPriceTRY', 'ada', 'parsel', 'assetType', 'inputMethod', 'tapuType', 'zoningStatus', 'roadAccess', 'electricity', 'water'];
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
        areaM2: Number(form.areaM2),
        askingPriceTRY: Number(form.askingPriceTRY),
        ada: form.ada.trim(),
        parsel: form.parsel.trim(),
        baslik: form.baslik.trim(),
        kategori: form.kategori.trim(),
        assetType: form.assetType,
        inputMethod: form.inputMethod,
        tapuType: form.tapuType,
        zoningStatus: form.zoningStatus,
        roadAccess: form.roadAccess,
        electricity: form.electricity,
        water: form.water,
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
    <div className="mx-auto mt-10 flex w-full max-w-3xl md:max-w-5xl lg:max-w-6xl flex-col gap-6 px-2 md:px-8 pb-12">
      <div className="premium-dashboard premium-surface rounded shadow p-8 md:p-10 lg:p-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Hoşgeldiniz, {user?.name}</h2>
        <div className="mb-2 text-base md:text-lg text-slate-600 text-center">Yeni mülk analizi başlatın, ardından kaynakları yükleyin ve rehber raporu inceleyin.</div>
        <div className="mb-2 text-base text-center">Kredi bakiyesi: <b>{loadingCredits ? '...' : credits}</b></div>
        {creditsError ? <div className="text-red-600 text-base mb-2 text-center">{creditsError}</div> : null}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Link to="/reports" className="premium-outline px-4 py-2 rounded text-base">Raporlarım</Link>
          <Link to="/credits" className="premium-outline px-4 py-2 rounded text-base">Kredi Yükle</Link>
        </div>
        <button className="mt-8 text-red-600 underline block mx-auto text-base" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>Çıkış Yap</button>
      </div>

      {/* New property intake card */}
      <form className="premium-dashboard premium-surface rounded shadow p-8 md:p-10 lg:p-12 mt-4 w-full" onSubmit={handleSubmit} style={{maxWidth:'900px',margin:'0 auto'}}>
        <h3 className="text-2xl font-semibold mb-4 text-center">Yeni Mülk Kaydı</h3>
        <div className="mb-2 text-base text-center font-semibold">
          {locationStatus.source === 'CACHE'
            ? 'Kayseri konum verisi yüklendi'
            : 'Pilot konum verisi kullanılıyor; tam Kayseri veri importu bekleniyor'}
        </div>
        <div className="mb-4 text-base text-slate-700 text-center font-medium">Ada/parsel ve temel fiyat bilgileri girildikten sonra kaynak kontrol ekranına geçebilirsiniz.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Varlık Türü (assetType) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Varlık Türü *</label>
                      <select className={inputClass('assetType') + ' h-[44px] text-[16px]'} name="assetType" value={form.assetType} onChange={handleChange}>
                        <option value="ARSA">Arsa</option>
                        <option value="TARLA">Tarla</option>
                        <option value="BAHCE">Bahçe</option>
                        <option value="KONUT">Konut</option>
                        <option value="TICARI">Ticari</option>
                        <option value="PROJE">Proje</option>
                        <option value="DIGER">Diğer</option>
                      </select>
                      {fieldErrors.assetType && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.assetType}</div>}
                    </div>
                    {/* Giriş Yöntemi (inputMethod) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Giriş Yöntemi *</label>
                      <select className={inputClass('inputMethod') + ' h-[44px] text-[16px]'} name="inputMethod" value={form.inputMethod} onChange={handleChange}>
                        <option value="ADA_PARSEL">Ada/Parsel</option>
                        <option value="ILAN_URL">İlan URL</option>
                        <option value="SCREENSHOT_UPLOAD">Ekran görüntüsü yükleme</option>
                        <option value="MANUAL_ENTRY">Manuel giriş</option>
                      </select>
                      {fieldErrors.inputMethod && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.inputMethod}</div>}
                    </div>
                    {/* Tapu Türü (tapuType) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Tapu Türü *</label>
                      <select className={inputClass('tapuType') + ' h-[44px] text-[16px]'} name="tapuType" value={form.tapuType} onChange={handleChange}>
                        <option value="MUSTAKIL">Müstakil</option>
                        <option value="HISSELI">Hisseli</option>
                        <option value="KAT_IRTIFAKI">Kat irtifakı</option>
                        <option value="KAT_MULKIYETI">Kat mülkiyeti</option>
                        <option value="UNKNOWN">Emin değilim</option>
                      </select>
                      {fieldErrors.tapuType && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.tapuType}</div>}
                    </div>
                    {/* İmar Durumu (zoningStatus) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">İmar Durumu *</label>
                      <select className={inputClass('zoningStatus') + ' h-[44px] text-[16px]'} name="zoningStatus" value={form.zoningStatus} onChange={handleChange}>
                        <option value="IMARLI">İmarlı</option>
                        <option value="IMARSIZ">İmarsız</option>
                        <option value="KOY_YERLESIK_ALANI">Köy yerleşik alanı</option>
                        <option value="TARIMSAL">Tarımsal</option>
                        <option value="BAG_BAHCE">Bağ/Bahçe</option>
                        <option value="TICARI">Ticari</option>
                        <option value="KONUT">Konut</option>
                        <option value="UNKNOWN">Emin değilim</option>
                      </select>
                      {fieldErrors.zoningStatus && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.zoningStatus}</div>}
                    </div>
                    {/* Yol Durumu (roadAccess) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Yol Durumu *</label>
                      <select className={inputClass('roadAccess') + ' h-[44px] text-[16px]'} name="roadAccess" value={form.roadAccess} onChange={handleChange}>
                        <option value="KADASTRO_YOLU">Kadastro yolu</option>
                        <option value="FIILI_YOL">Fiili yol</option>
                        <option value="YOL_YOK">Yol yok</option>
                        <option value="UNKNOWN">Emin değilim</option>
                      </select>
                      {fieldErrors.roadAccess && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.roadAccess}</div>}
                    </div>
                    {/* Elektrik (electricity) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Elektrik *</label>
                      <select className={inputClass('electricity') + ' h-[44px] text-[16px]'} name="electricity" value={form.electricity} onChange={handleChange}>
                        <option value="VAR">Var</option>
                        <option value="YAKIN">Yakın</option>
                        <option value="YOK">Yok</option>
                        <option value="UNKNOWN">Emin değilim</option>
                      </select>
                      {fieldErrors.electricity && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.electricity}</div>}
                    </div>
                    {/* Su (water) */}
                    <div>
                      <label className="block text-[15px] font-bold mb-1">Su *</label>
                      <select className={inputClass('water') + ' h-[44px] text-[16px]'} name="water" value={form.water} onChange={handleChange}>
                        <option value="VAR">Var</option>
                        <option value="YAKIN">Yakın</option>
                        <option value="YOK">Yok</option>
                        <option value="UNKNOWN">Emin değilim</option>
                      </select>
                      {fieldErrors.water && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.water}</div>}
                    </div>
          {/* İl */}
          <div>
            <label className="block text-[15px] font-bold mb-1">İl *</label>
            <select className={inputClass('il') + ' h-[48px] text-[16px]'} name="il" value={form.il} onChange={handleChange}>
              <option value="">İl seçiniz...</option>
              {getProvinceOptions().map((il) => (
                <option key={il} value={il}>{il}</option>
              ))}
            </select>
            {fieldErrors.il && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.il}</div>}
          </div>
          {/* İlçe */}
          <div>
            <label className="block text-[15px] font-bold mb-1">İlçe *</label>
            <select className={inputClass('ilce') + ' h-[48px] text-[16px]'} name="ilce" value={form.ilce} onChange={handleChange} disabled={!form.il}>
              <option value="">İlçe seçiniz...</option>
              {getDistrictOptions(form.il).map((ilce) => (
                <option key={ilce} value={ilce}>{ilce}</option>
              ))}
            </select>
            {fieldErrors.ilce && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.ilce}</div>}
          </div>
          {/* Mahalle/Köy */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Mahalle/Köy *</label>
            <select className={inputClass('mahalleOrKoy') + ' h-[48px] text-[16px]'} name="mahalleOrKoy" value={form.mahalleOrKoy} onChange={handleChange} disabled={!form.ilce || getNeighborhoodOptions(form.il, form.ilce).length === 0}>
              <option value="">Mahalle/Köy seçiniz...</option>
              {getNeighborhoodOptions(form.il, form.ilce).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {fieldErrors.mahalleOrKoy && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.mahalleOrKoy}</div>}
            {/* Manual fallback for other locations */}
            <div className="mt-2 text-[14px] text-slate-600 font-medium">Mahalle/Köy manuel giriş</div>
            <input className={inputClass('mahalleOrKoy') + ' h-[44px] text-[16px] mt-1'} name="mahalleOrKoy" placeholder="Mahalle/Köy manuel giriş" value={form.mahalleOrKoy} onChange={handleChange} />
          </div>
          {/* Ada */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Ada *</label>
            <input className={inputClass('ada') + ' h-[44px] text-[16px]'} name="ada" value={form.ada} onChange={handleChange} />
            {fieldErrors.ada && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.ada}</div>}
          </div>
          {/* Parsel */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Parsel *</label>
            <input className={inputClass('parsel') + ' h-[44px] text-[16px]'} name="parsel" value={form.parsel} onChange={handleChange} />
            {fieldErrors.parsel && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.parsel}</div>}
          </div>
          {/* Alan (m²) */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Alan (m²) *</label>
            <input className={inputClass('areaM2') + ' h-[44px] text-[16px]'} name="areaM2" value={form.areaM2} onChange={handleChange} />
            {fieldErrors.areaM2 && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.areaM2}</div>}
          </div>
          {/* Fiyat (TL) */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Fiyat (TL) *</label>
            <input className={inputClass('askingPriceTRY') + ' h-[44px] text-[16px]'} name="askingPriceTRY" value={form.askingPriceTRY} onChange={handleChange} />
            {fieldErrors.askingPriceTRY && <div className="text-red-600 text-[15px] mt-1">{fieldErrors.askingPriceTRY}</div>}
          </div>
          {/* Başlık (opsiyonel) */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Başlık (opsiyonel)</label>
            <input className={inputClass('baslik') + ' h-[44px] text-[16px]'} name="baslik" value={form.baslik} onChange={handleChange} />
          </div>
          {/* Kategori (opsiyonel) */}
          <div>
            <label className="block text-[15px] font-bold mb-1">Kategori (opsiyonel)</label>
            <input className={inputClass('kategori') + ' h-[44px] text-[16px]'} name="kategori" value={form.kategori} onChange={handleChange} />
          </div>
        </div>
        {submitError && <div className="text-red-600 text-[16px] mt-4 text-center font-semibold">{submitError}</div>}
        <button
          type="submit"
          className="mt-6 bg-blue-700 text-white px-6 py-3 rounded font-bold text-lg w-full max-w-xs mx-auto block disabled:bg-blue-300 shadow-lg"
          disabled={submitting}
        >
          Mülkü kaydet ve kaynakları kontrol et
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
