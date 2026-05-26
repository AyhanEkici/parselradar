import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useLocation, useNavigate } from 'react-router-dom';

interface PropertyForm {
  [key: string]: string | number | boolean | string[] | undefined;
}

type Option = { value: string; label: string };

const assetTypeOptions: Option[] = [
  { value: 'ARSA', label: 'Arsa' },
  { value: 'TARLA', label: 'Tarla' },
  { value: 'BAHCE', label: 'BahÃ§e' },
  { value: 'KONUT', label: 'Konut' },
  { value: 'TICARI', label: 'Ticari' },
  { value: 'PROJE', label: 'Proje' },
  { value: 'DIGER', label: 'DiÄŸer' },
];

const inputMethodOptions: Option[] = [
  { value: 'ILAN_URL', label: 'Ä°lan URL' },
  { value: 'SCREENSHOT_UPLOAD', label: 'Ekran gÃ¶rÃ¼ntÃ¼sÃ¼ yÃ¼kleme' },
  { value: 'ADA_PARSEL', label: 'Ada/Parsel' },
  { value: 'MANUAL_ENTRY', label: 'Manuel giriÅŸ' },
];

const tapuTypeOptions: Option[] = [
  { value: 'MUSTAKIL', label: 'MÃ¼stakil' },
  { value: 'HISSELI', label: 'Hisseli' },
  { value: 'KAT_IRTIFAKI', label: 'Kat irtifakÄ±' },
  { value: 'KAT_MULKIYETI', label: 'Kat mÃ¼lkiyeti' },
  { value: 'UNKNOWN', label: 'Emin deÄŸilim' },
];

const zoningStatusOptions: Option[] = [
  { value: 'IMARLI', label: 'Ä°marlÄ±' },
  { value: 'IMARSIZ', label: 'Ä°marsÄ±z' },
  { value: 'KOY_YERLESIK_ALANI', label: 'KÃ¶y yerleÅŸik alanÄ±' },
  { value: 'TARIMSAL', label: 'TarÄ±msal' },
  { value: 'BAG_BAHCE', label: 'BaÄŸ/BahÃ§e' },
  { value: 'TICARI', label: 'Ticari' },
  { value: 'KONUT', label: 'Konut' },
  { value: 'UNKNOWN', label: 'Emin deÄŸilim' },
];

const roadAccessOptions: Option[] = [
  { value: 'KADASTRO_YOLU', label: 'Kadastro yolu' },
  { value: 'FIILI_YOL', label: 'Fiili yol' },
  { value: 'YOL_YOK', label: 'Yol yok' },
  { value: 'UNKNOWN', label: 'Emin deÄŸilim' },
];

const utilityStatusOptions: Option[] = [
  { value: 'VAR', label: 'Var' },
  { value: 'YAKIN', label: 'YakÄ±n' },
  { value: 'YOK', label: 'Yok' },
  { value: 'UNKNOWN', label: 'Emin deÄŸilim' },
];

export default function NewProperty() {
  const DRAFT_KEY = 'parselradar:new-property:draft';
  const TOTAL_STEPS = 3;
  const [form, setForm] = useState<PropertyForm>({});
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftMessage, setDraftMessage] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [allowDealFlowMatching, setAllowDealFlowMatching] = useState(false);
  const [allowProfessionalContact, setAllowProfessionalContact] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      setHasDraft(Boolean(window.localStorage.getItem(DRAFT_KEY)));
    } catch {
      setHasDraft(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.toString()) return;

    const prefilled: PropertyForm = {};
    const prefillKeys = ['il', 'ilce', 'mahalleOrKoy', 'ada', 'parsel', 'areaM2', 'askingPriceTRY', 'ilanUrl'];
    prefillKeys.forEach((key) => {
      const value = params.get(key);
      if (value && value.trim()) {
        prefilled[key] = value.trim();
      }
    });

    if (Object.keys(prefilled).length > 0) {
      setForm((prev) => ({ ...prefilled, ...prev }));
    }
  }, [location.search]);

  const persistDraft = (nextForm: PropertyForm) => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(nextForm));
      setHasDraft(true);
      setDraftMessage('Taslak kaydedildi');
      setTimeout(() => setDraftMessage(''), 2000);
    } catch {
      setDraftMessage('Draft kaydedilemedi');
    }
  };

  const continueDraft = () => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PropertyForm;
      setForm(parsed || {});
      setDraftMessage('Taslak yÃ¼klendi');
      setTimeout(() => setDraftMessage(''), 2000);
    } catch {
      setDraftMessage('Draft okunamadÄ±');
    }
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      setDraftMessage('Taslak temizlendi');
      setTimeout(() => setDraftMessage(''), 2000);
    } catch {
      setDraftMessage('Draft temizlenemedi');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const nextForm = { ...form, [e.target.name]: e.target.value };
    setForm(nextForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      // Remove forbidden fields if present
      const clientFields = { ...form };
      delete clientFields.userId;
      delete clientFields.createdAt;
      delete clientFields.updatedAt;
      delete clientFields.pricePerM2;
      const dealFlowConsentScope = allowDealFlowMatching
        ? ['PROFESSIONAL_MATCHING', ...(allowProfessionalContact ? ['PROFESSIONAL_CONTACT'] : [])]
        : [];

      clientFields.dealFlowConsentStatus = allowDealFlowMatching ? 'OPTED_IN' : 'NOT_ASKED';
      clientFields.dealFlowConsentAt = allowDealFlowMatching ? new Date().toISOString() : undefined;
      clientFields.dealFlowConsentScope = dealFlowConsentScope;
      clientFields.professionalContactAllowed = allowDealFlowMatching ? allowProfessionalContact : false;

      const property = await apiFetch('properties', { method: 'POST', body: JSON.stringify(clientFields) });
      window.localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      navigate(`/properties/${property._id}/documents`);
    } catch (err) {
      const apiError = err as { error?: string; fields?: Record<string, string> };
      setError(apiError.error || 'Validation failed');
      setFieldErrors(apiError.fields || {});
    }
  };

  const inputClass = (name: string) =>
    `w-full border p-2 ${fieldErrors[name] ? 'border-red-500' : 'border-gray-300'}`;

  const nextStep = () => {
    setError('');
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Yeni MÃ¼lk</h2>
      <div className="mb-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        Start with Yeni MÃ¼lk. After the property is created, documents, evidence, source guidance and report pages help you review it step by step.
      </div>
      <div className="mb-3 text-sm text-gray-600">AdÄ±m {step} / {TOTAL_STEPS}</div>
      {hasDraft ? (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="font-medium mb-2">KayÄ±tlÄ± taslaÄŸa devam etmek ister misiniz?</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="bg-amber-600 text-white px-3 py-1 rounded" onClick={continueDraft}>TaslaÄŸa devam et</button>
            <button type="button" className="bg-white border border-amber-300 px-3 py-1 rounded" onClick={clearDraft}>TaslaÄŸÄ± temizle</button>
          </div>
        </div>
      ) : null}
      {draftMessage ? <div className="mb-3 text-sm text-green-700">{draftMessage}</div> : null}
      <form onSubmit={handleSubmit} className="space-y-2">
        {step === 1 && (
          <>
            <label className="block text-sm font-medium">VarlÄ±k TÃ¼rÃ¼ *</label>
            <select className={inputClass('assetType')} name="assetType" required value={String(form.assetType || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.assetType && <div className="text-sm text-red-600">{fieldErrors.assetType}</div>}

            <label className="block text-sm font-medium">GiriÅŸ YÃ¶ntemi *</label>
            <select className={inputClass('inputMethod')} name="inputMethod" required value={String(form.inputMethod || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {inputMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.inputMethod && <div className="text-sm text-red-600">{fieldErrors.inputMethod}</div>}

            <input className="w-full border p-2" name="ilanUrl" P2_1A_TRIAGED_BACKLOG="Ä°lan URL" value={String(form.ilanUrl || '')} onChange={handleChange} />

            <label className="block text-sm font-medium">Ä°l *</label>
            <input className={inputClass('il')} name="il" P2_1A_TRIAGED_BACKLOG="Ä°l" required value={String(form.il || '')} onChange={handleChange} />
            {fieldErrors.il && <div className="text-sm text-red-600">{fieldErrors.il}</div>}

            <label className="block text-sm font-medium">Ä°lÃ§e *</label>
            <input className={inputClass('ilce')} name="ilce" P2_1A_TRIAGED_BACKLOG="Ä°lÃ§e" required value={String(form.ilce || '')} onChange={handleChange} />
            {fieldErrors.ilce && <div className="text-sm text-red-600">{fieldErrors.ilce}</div>}

            <label className="block text-sm font-medium">Mahalle/KÃ¶y *</label>
            <input className={inputClass('mahalleOrKoy')} name="mahalleOrKoy" P2_1A_TRIAGED_BACKLOG="Mahalle/KÃ¶y" required value={String(form.mahalleOrKoy || '')} onChange={handleChange} />
            {fieldErrors.mahalleOrKoy && <div className="text-sm text-red-600">{fieldErrors.mahalleOrKoy}</div>}

            <input className="w-full border p-2" name="addressText" P2_1A_TRIAGED_BACKLOG="Adres" value={String(form.addressText || '')} onChange={handleChange} />
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm font-medium">Fiyat (TL) *</label>
            <input className={inputClass('askingPriceTRY')} name="askingPriceTRY" P2_1A_TRIAGED_BACKLOG="Fiyat (TL)" type="number" required value={String(form.askingPriceTRY || '')} onChange={handleChange} />
            {fieldErrors.askingPriceTRY && <div className="text-sm text-red-600">{fieldErrors.askingPriceTRY}</div>}

            <label className="block text-sm font-medium">Alan (mÂ²) *</label>
            <input className={inputClass('areaM2')} name="areaM2" P2_1A_TRIAGED_BACKLOG="Alan (mÂ²)" type="number" required value={String(form.areaM2 || '')} onChange={handleChange} />
            {fieldErrors.areaM2 && <div className="text-sm text-red-600">{fieldErrors.areaM2}</div>}

            <input className="w-full border p-2" name="ada" P2_1A_TRIAGED_BACKLOG="Ada" value={String(form.ada || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="parsel" P2_1A_TRIAGED_BACKLOG="Parsel" value={String(form.parsel || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="pafta" P2_1A_TRIAGED_BACKLOG="Pafta" value={String(form.pafta || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="nitelik" P2_1A_TRIAGED_BACKLOG="Nitelik" value={String(form.nitelik || '')} onChange={handleChange} />

            <label className="block text-sm font-medium">Tapu TÃ¼rÃ¼ *</label>
            <select className={inputClass('tapuType')} name="tapuType" required value={String(form.tapuType || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {tapuTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.tapuType && <div className="text-sm text-red-600">{fieldErrors.tapuType}</div>}

            <label className="block text-sm font-medium">Ä°mar Durumu *</label>
            <select className={inputClass('zoningStatus')} name="zoningStatus" required value={String(form.zoningStatus || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {zoningStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.zoningStatus && <div className="text-sm text-red-600">{fieldErrors.zoningStatus}</div>}
          </>
        )}

        {step === 3 && (
          <>
            <input className="w-full border p-2" name="taks" P2_1A_TRIAGED_BACKLOG="TAKS" value={String(form.taks || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="kaks" P2_1A_TRIAGED_BACKLOG="KAKS" value={String(form.kaks || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="emsal" P2_1A_TRIAGED_BACKLOG="Emsal" value={String(form.emsal || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="gabari" P2_1A_TRIAGED_BACKLOG="Gabari" value={String(form.gabari || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="hmax" P2_1A_TRIAGED_BACKLOG="Hmax" value={String(form.hmax || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="katAdedi" P2_1A_TRIAGED_BACKLOG="Kat Adedi" value={String(form.katAdedi || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="cekmeMesafeleri" P2_1A_TRIAGED_BACKLOG="Ã‡ekme Mesafeleri" value={String(form.cekmeMesafeleri || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="planNotlariText" P2_1A_TRIAGED_BACKLOG="Plan NotlarÄ±" value={String(form.planNotlariText || '')} onChange={handleChange} />

            <label className="block text-sm font-medium">Yol Durumu *</label>
            <select className={inputClass('roadAccess')} name="roadAccess" required value={String(form.roadAccess || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {roadAccessOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.roadAccess && <div className="text-sm text-red-600">{fieldErrors.roadAccess}</div>}

            <label className="block text-sm font-medium">Elektrik *</label>
            <select className={inputClass('electricity')} name="electricity" required value={String(form.electricity || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {utilityStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.electricity && <div className="text-sm text-red-600">{fieldErrors.electricity}</div>}

            <label className="block text-sm font-medium">Su *</label>
            <select className={inputClass('water')} name="water" required value={String(form.water || '')} onChange={handleChange}>
              <option value="">SeÃ§iniz...</option>
              {utilityStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.water && <div className="text-sm text-red-600">{fieldErrors.water}</div>}

            <input className="w-full border p-2" name="villageDistanceText" P2_1A_TRIAGED_BACKLOG="KÃ¶y Mesafesi" value={String(form.villageDistanceText || '')} onChange={handleChange} />

            <div className="mt-4 rounded border border-sky-200 bg-sky-50 p-3">
              <h3 className="text-sm font-semibold text-sky-900">Optional professional matching</h3>
              <p className="mt-1 text-xs text-sky-800 leading-relaxed">
                Bu mÃ¼lk kaydÄ±nÄ± gelecekte profesyonel eÅŸleÅŸtirme iÃ§in kullanmamÄ±za izin verebilirsiniz. Bu adÄ±m isteÄŸe baÄŸlÄ±dÄ±r ve varsayÄ±lan olarak kayÄ±t gizli kalÄ±r.
              </p>
              <label className="mt-3 flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={allowDealFlowMatching}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAllowDealFlowMatching(checked);
                    if (!checked) setAllowProfessionalContact(false);
                  }}
                  className="mt-1"
                />
                <span>Bu mÃ¼lk kaydÄ±nÄ±n gelecekte isteÄŸe baÄŸlÄ± profesyonel eÅŸleÅŸtirme iÃ§in kullanÄ±lmasÄ±na izin veriyorum.</span>
              </label>
              <label className="mt-2 flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={allowProfessionalContact}
                  onChange={(e) => setAllowProfessionalContact(e.target.checked)}
                  disabled={!allowDealFlowMatching}
                  className="mt-1"
                />
                <span>Bu mÃ¼lk kaydÄ± hakkÄ±nda bir uzmanÄ±n benimle iletiÅŸime geÃ§mesine izin veriyorum.</span>
              </label>
              <p className="mt-2 text-xs text-slate-600">
                VarsayÄ±lan durum gizlidir. Bu onayÄ± vermeden mÃ¼lk kaydÄ± oluÅŸturabilirsiniz.
              </p>
            </div>
          </>
        )}

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="bg-gray-200 px-3 py-2 rounded" onClick={() => navigate('/dashboard')}>Panele dÃ¶n</button>
          <button type="button" className="bg-gray-200 px-3 py-2 rounded" onClick={() => navigate('/dashboard')}>Ä°ptal</button>
          <button type="button" className="bg-amber-600 text-white px-3 py-2 rounded" onClick={() => persistDraft(form)}>TaslaÄŸÄ± kaydet</button>
          <button type="button" className="bg-gray-300 px-3 py-2 rounded" disabled={step === 1} onClick={prevStep}>Geri</button>
          {step < TOTAL_STEPS ? (
            <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded" onClick={nextStep}>Ä°leri</button>
          ) : (
            <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Kaydet ve Belgeler</button>
          )}
        </div>
      </form>
    </div>
  );
}

