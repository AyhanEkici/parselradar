import React, { useEffect, useState } from 'react';

// --- P2.2E-2 helpers (do not export) ---
function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPositiveNumber(value: unknown): boolean {
  const n = Number(value);
  return !isNaN(n) && n > 0;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Task B: Listing URL optional, require at least one of URL, pasted text, or uploaded evidence
function validatePropertyForm(form: PropertyForm, hasEvidence?: boolean): { valid: boolean; fields: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (form.inputMethod === 'ADA_PARSEL') {
    if (!normalizeString(form.assetType)) errors.assetType = 'Varlık türü gerekli';
    if (!normalizeString(form.inputMethod)) errors.inputMethod = 'Giriş yöntemi gerekli';
    if (!normalizeString(form.il)) errors.il = 'İl gerekli';
    if (!normalizeString(form.ilce)) errors.ilce = 'İlçe gerekli';
    if (!normalizeString(form.mahalleOrKoy)) errors.mahalleOrKoy = 'Mahalle/Köy gerekli';
    if (!normalizeString(form.ada)) errors.ada = 'Ada gerekli';
    if (!normalizeString(form.parsel)) errors.parsel = 'Parsel gerekli';
    if (!isPositiveNumber(form.askingPriceTRY)) errors.askingPriceTRY = 'Fiyat gerekli';
    if (!isPositiveNumber(form.areaM2)) errors.areaM2 = 'm² alanı gerekli';
    if (!normalizeString(form.tapuType)) errors.tapuType = 'Tapu tipi gerekli';
    if (!normalizeString(form.zoningStatus)) errors.zoningStatus = 'İmar durumu gerekli';
    if (!normalizeString(form.roadAccess)) errors.roadAccess = 'Yol durumu gerekli';
    if (!normalizeString(form.electricity)) errors.electricity = 'Elektrik durumu gerekli';
    if (!normalizeString(form.water)) errors.water = 'Su durumu gerekli';
  } else if (form.inputMethod === 'ILAN_URL' || form.inputMethod === 'SCREENSHOT_UPLOAD' || form.inputMethod === 'MANUAL_ENTRY') {
    if (!normalizeString(form.assetType)) errors.assetType = 'Varlık türü gerekli';
    if (!normalizeString(form.inputMethod)) errors.inputMethod = 'Giriş yöntemi gerekli';
    const ilanUrl = normalizeString(form.ilanUrl);
    const pastedText = normalizeString(form.pastedText);
    // Accept if at least one: ilanUrl (valid), pastedText, or uploaded evidence
    const hasValidUrl = ilanUrl ? isHttpUrl(ilanUrl) : false;
    const hasText = Boolean(pastedText);
    const hasFile = Boolean(hasEvidence);
    if (!hasValidUrl && ilanUrl) errors.ilanUrl = "İlan URL geçerli bir http/https adresi olmalı veya boş bırakılmalı";
    if (!hasValidUrl && !hasText && !hasFile) {
      errors.ilanUrl = "Kaynak gerekli: ilan URL'si, yapistirilmis ilan metni veya yuklenmis ekran goruntusu/belge ekleyin.";
    }
    if (!isPositiveNumber(form.askingPriceTRY)) errors.askingPriceTRY = 'Fiyat gerekli';
    if (!isPositiveNumber(form.areaM2)) errors.areaM2 = 'm² alanı gerekli';
    if (!normalizeString(form.tapuType)) errors.tapuType = 'Tapu tipi gerekli';
    if (!normalizeString(form.zoningStatus)) errors.zoningStatus = 'İmar durumu gerekli';
    if (!normalizeString(form.roadAccess)) errors.roadAccess = 'Yol durumu gerekli';
    if (!normalizeString(form.electricity)) errors.electricity = 'Elektrik durumu gerekli';
    if (!normalizeString(form.water)) errors.water = 'Su durumu gerekli';
  }
  return { valid: Object.keys(errors).length === 0, fields: errors };
}

function validateStep(step: number, form: PropertyForm): { valid: boolean; fields: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (form.inputMethod === 'ADA_PARSEL') {
      if (!normalizeString(form.assetType)) errors.assetType = 'Varlık türü gerekli';
      if (!normalizeString(form.inputMethod)) errors.inputMethod = 'Giriş yöntemi gerekli';
      if (!normalizeString(form.il)) errors.il = 'İl gerekli';
      if (!normalizeString(form.ilce)) errors.ilce = 'İlçe gerekli';
      if (!normalizeString(form.mahalleOrKoy)) errors.mahalleOrKoy = 'Mahalle/Köy gerekli';
      if (!normalizeString(form.ada)) errors.ada = 'Ada gerekli';
      if (!normalizeString(form.parsel)) errors.parsel = 'Parsel gerekli';
    } else if (form.inputMethod === 'ILAN_URL') {
      if (!normalizeString(form.assetType)) errors.assetType = 'Varlık türü gerekli';
      if (!normalizeString(form.inputMethod)) errors.inputMethod = 'Giriş yöntemi gerekli';
      if (!isHttpUrl(form.ilanUrl)) errors.ilanUrl = 'İlan URL geçerli bir http/https adresi olmalı veya boş bırakılmalı';
    }
  } else if (step === 2) {
    if (!isPositiveNumber(form.askingPriceTRY)) errors.askingPriceTRY = 'Fiyat gerekli';
    if (!isPositiveNumber(form.areaM2)) errors.areaM2 = 'm² alanı gerekli';
    if (!normalizeString(form.tapuType)) errors.tapuType = 'Tapu tipi gerekli';
    if (!normalizeString(form.zoningStatus)) errors.zoningStatus = 'İmar durumu gerekli';
  } else if (step === 3) {
    if (!normalizeString(form.roadAccess)) errors.roadAccess = 'Yol durumu gerekli';
    if (!normalizeString(form.electricity)) errors.electricity = 'Elektrik durumu gerekli';
    if (!normalizeString(form.water)) errors.water = 'Su durumu gerekli';
  }
  return { valid: Object.keys(errors).length === 0, fields: errors };
}

function buildPropertyCreatePayload(form: PropertyForm): PropertyForm {
  const payload: PropertyForm = { ...form };
  if (form.inputMethod === 'ADA_PARSEL') {
    // Omit ilanUrl if blank, not a URL, or matches ada/parsel pattern
    if (
      !form.ilanUrl ||
      typeof form.ilanUrl !== 'string' ||
      /^\d+[\/\\]\d+$/.test(form.ilanUrl.trim()) ||
      !isHttpUrl(form.ilanUrl)
    ) {
      delete payload.ilanUrl;
    }
    // Always include ada and parsel
    payload.ada = normalizeString(form.ada);
    payload.parsel = normalizeString(form.parsel);
  } else if (form.inputMethod === 'ILAN_URL') {
    // Only include ilanUrl if valid http/https
    if (!isHttpUrl(form.ilanUrl)) {
      delete payload.ilanUrl;
    }
  }
  return payload;
}

import { apiFetch } from '../lib/api';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getProvinceOptions,
  getDistrictOptions,
  getNeighborhoodOptions,
  getLocationCoverageStatus
} from '../lib/locationOptions';
  const locationStatus = getLocationCoverageStatus();

interface PropertyForm {
  [key: string]: string | number | boolean | string[] | undefined;
}

type Option = { value: string; label: string };

const assetTypeOptions: Option[] = [
  { value: 'ARSA', label: 'Arsa' },
  { value: 'TARLA', label: 'Tarla' },
  { value: 'BAHCE', label: 'Bahçe' },
  { value: 'KONUT', label: 'Konut' },
  { value: 'TICARI', label: 'Ticari' },
  { value: 'PROJE', label: 'Proje' },
  { value: 'DIGER', label: 'Diğer' },
];

const inputMethodOptions: Option[] = [
  { value: 'ILAN_URL', label: 'İlan URL' },
  { value: 'SCREENSHOT_UPLOAD', label: 'Ekran görüntüsü yükleme' },
  { value: 'ADA_PARSEL', label: 'Ada/Parsel' },
  { value: 'MANUAL_ENTRY', label: 'Manuel giriş' },
];

const tapuTypeOptions: Option[] = [
  { value: 'MUSTAKIL', label: 'Müstakil' },
  { value: 'HISSELI', label: 'Hisseli' },
  { value: 'KAT_IRTIFAKI', label: 'Kat irtifakı' },
  { value: 'KAT_MULKIYETI', label: 'Kat mülkiyeti' },
  { value: 'UNKNOWN', label: 'Emin değilim' },
];

const zoningStatusOptions: Option[] = [
  { value: 'IMARLI', label: 'İmarlı' },
  { value: 'IMARSIZ', label: 'İmarsız' },
  { value: 'KOY_YERLESIK_ALANI', label: 'Köy yerleşik alanı' },
  { value: 'TARIMSAL', label: 'Tarımsal' },
  { value: 'BAG_BAHCE', label: 'Bağ/Bahçe' },
  { value: 'TICARI', label: 'Ticari' },
  { value: 'KONUT', label: 'Konut' },
  { value: 'UNKNOWN', label: 'Emin değilim' },
];

const roadAccessOptions: Option[] = [
  { value: 'KADASTRO_YOLU', label: 'Kadastro yolu' },
  { value: 'FIILI_YOL', label: 'Fiili yol' },
  { value: 'YOL_YOK', label: 'Yol yok' },
  { value: 'UNKNOWN', label: 'Emin değilim' },
];

const utilityStatusOptions: Option[] = [
  { value: 'VAR', label: 'Var' },
  { value: 'YAKIN', label: 'Yakın' },
  { value: 'YOK', label: 'Yok' },
  { value: 'UNKNOWN', label: 'Emin değilim' },
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
      setDraftMessage('Taslak yüklendi');
      setTimeout(() => setDraftMessage(''), 2000);
    } catch {
      setDraftMessage('Draft okunamadı');
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

  // Task B: Check for uploaded evidence in localStorage (PropertyDocuments intake draft)
  const hasUploadedEvidence = (() => {
    try {
      const draft = window.localStorage.getItem('parselradar:mvp4b-listing-intake:' + (form._id || ''));
      if (draft) {
        const parsed = JSON.parse(draft);
        return parsed && parsed.hasScreenshotOrDocument;
      }
    } catch {}
    return false;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const { valid, fields } = validatePropertyForm(form, hasUploadedEvidence);
    if (!valid) {
      setFieldErrors(fields);
      setError('Lütfen gerekli alanları doldurun.');
      return;
    }

    let clientFields = buildPropertyCreatePayload(form);

    // Remove forbidden fields if present
    delete clientFields.userId;
    delete clientFields.createdAt;
    delete clientFields.updatedAt;
    delete clientFields.pricePerM2;

    // Consent fields
    const dealFlowConsentScope = allowDealFlowMatching
      ? ['PROFESSIONAL_MATCHING', ...(allowProfessionalContact ? ['PROFESSIONAL_CONTACT'] : [])]
      : [];
    clientFields.dealFlowConsentStatus = allowDealFlowMatching ? 'OPTED_IN' : 'NOT_ASKED';
    clientFields.dealFlowConsentAt = allowDealFlowMatching ? new Date().toISOString() : undefined;
    clientFields.dealFlowConsentScope = dealFlowConsentScope;
    clientFields.professionalContactAllowed = allowDealFlowMatching ? allowProfessionalContact : false;

    try {
      const property = await apiFetch('properties', { method: 'POST', body: JSON.stringify(clientFields) });
      window.localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      navigate(`/properties/${property._id}/documents`);
    } catch (err) {
      const apiError = err as { error?: string; fields?: Record<string, string> };
      setError(apiError.error || 'Doğrulama hatası oluştu.');
      setFieldErrors(apiError.fields || {});
    }
  };

  const inputClass = (name: string) =>
    `w-full border p-2 rounded ${fieldErrors[name] ? 'border-red-500' : 'border-gray-300'}`;

  const nextStep = () => {
    setError('');
    const { valid, fields } = validateStep(step, form);
    if (!valid) {
      setFieldErrors(fields);
      setError('Lütfen gerekli alanları doldurun.');
      return;
    }
    setFieldErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto p-4 premium-dashboard premium-surface rounded shadow">
      <form onSubmit={handleSubmit}>
        {/* Step 1: Location and property info */}
        {step === 1 && (
          <>
            {/* Location provider status */}
            <div className="mb-2 text-base text-center font-semibold">
              {locationStatus.source === 'CACHE'
                ? 'Kayseri konum verisi yüklendi'
                : 'Pilot konum verisi kullanılıyor; tam Kayseri veri importu bekleniyor'}
            </div>
            {/* Location dropdowns and manual fallback */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">İl *</label>
              <select
                className={inputClass('il') + ' h-[44px] text-[16px]'}
                name="il"
                value={form.il || ''}
                onChange={handleChange}
              >
                <option value="">İl seçiniz...</option>
                {getProvinceOptions().map((il) => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
              {fieldErrors.il && <div className="text-red-600 text-sm mt-1">{fieldErrors.il}</div>}
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">İlçe *</label>
              <select
                className={inputClass('ilce') + ' h-[44px] text-[16px]'}
                name="ilce"
                value={form.ilce || ''}
                onChange={handleChange}
                disabled={!form.il}
              >
                <option value="">İlçe seçiniz...</option>
                {getDistrictOptions(form.il).map((ilce) => (
                  <option key={ilce} value={ilce}>{ilce}</option>
                ))}
              </select>
              {fieldErrors.ilce && <div className="text-red-600 text-sm mt-1">{fieldErrors.ilce}</div>}
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Mahalle/Köy *</label>
              <select
                className={inputClass('mahalleOrKoy') + ' h-[44px] text-[16px]'}
                name="mahalleOrKoy"
                value={form.mahalleOrKoy || ''}
                onChange={handleChange}
                disabled={!form.ilce || getNeighborhoodOptions(form.il, form.ilce).length === 0}
              >
                <option value="">Mahalle/Köy seçiniz...</option>
                {getNeighborhoodOptions(form.il, form.ilce).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {fieldErrors.mahalleOrKoy && <div className="text-red-600 text-sm mt-1">{fieldErrors.mahalleOrKoy}</div>}
              {/* Manual fallback for other locations */}
              <div className="mt-2 text-[14px] text-slate-600 font-medium">Mahalle/Köy manuel giriş</div>
              <input className={inputClass('mahalleOrKoy') + ' h-[44px] text-[16px] mt-1'} name="mahalleOrKoy" placeholder="Mahalle/Köy manuel giriş" value={form.mahalleOrKoy || ''} onChange={handleChange} />
            </div>
            <label className="block text-sm font-medium">Varlık Türü *</label>
            <select className={inputClass('assetType')} name="assetType" required value={String(form.assetType || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.assetType && <div className="text-sm text-red-600">{fieldErrors.assetType}</div>}

            <label className="block text-sm font-medium">Giriş Yöntemi *</label>
            <select className={inputClass('inputMethod')} name="inputMethod" required value={String(form.inputMethod || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {inputMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.inputMethod && <div className="text-sm text-red-600">{fieldErrors.inputMethod}</div>}

            {/* ADA_PARSEL: show ada/parsel fields, hide ilanUrl. Otherwise, show ilanUrl. */}
            {form.inputMethod === 'ADA_PARSEL' ? (
              <>
                <label className="block text-sm font-medium">Ada *</label>
                <input className={inputClass('ada')} name="ada" required value={String(form.ada || '')} onChange={handleChange} />
                {fieldErrors.ada && <div className="text-sm text-red-600">{fieldErrors.ada}</div>}

                <label className="block text-sm font-medium">Parsel *</label>
                <input className={inputClass('parsel')} name="parsel" required value={String(form.parsel || '')} onChange={handleChange} />
                {fieldErrors.parsel && <div className="text-sm text-red-600">{fieldErrors.parsel}</div>}
              </>
            ) : (
              <input className="w-full border p-2" name="ilanUrl" value={String(form.ilanUrl || '')} onChange={handleChange} />
            )}
          </>
        )}

        {/* Step 2: Price, area, etc. */}
        {step === 2 && (
          <>
            <label className="block text-sm font-medium">Fiyat (TL) *</label>
            <input className={inputClass('askingPriceTRY')} name="askingPriceTRY" type="number" required value={String(form.askingPriceTRY || '')} onChange={handleChange} />
            {fieldErrors.askingPriceTRY && <div className="text-sm text-red-600">{fieldErrors.askingPriceTRY}</div>}

            <label className="block text-sm font-medium">Alan (m²) *</label>
            <input className={inputClass('areaM2')} name="areaM2" type="number" required value={String(form.areaM2 || '')} onChange={handleChange} />
            {fieldErrors.areaM2 && <div className="text-sm text-red-600">{fieldErrors.areaM2}</div>}

            {/* Only show ada/parsel in Step 2 if inputMethod is not ADA_PARSEL (legacy/manual flows) */}
            {form.inputMethod !== 'ADA_PARSEL' && (
              <>
                <input className="w-full border p-2" name="ada" value={String(form.ada || '')} onChange={handleChange} />
                <input className="w-full border p-2" name="parsel" value={String(form.parsel || '')} onChange={handleChange} />
              </>
            )}
            <input className="w-full border p-2" name="pafta" value={String(form.pafta || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="nitelik" value={String(form.nitelik || '')} onChange={handleChange} />

            <label className="block text-sm font-medium">Tapu Türü *</label>
            <select className={inputClass('tapuType')} name="tapuType" required value={String(form.tapuType || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {tapuTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.tapuType && <div className="text-sm text-red-600">{fieldErrors.tapuType}</div>}

            <label className="block text-sm font-medium">İmar Durumu *</label>
            <select className={inputClass('zoningStatus')} name="zoningStatus" required value={String(form.zoningStatus || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {zoningStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.zoningStatus && <div className="text-sm text-red-600">{fieldErrors.zoningStatus}</div>}
          </>
        )}

        {/* Step 3: Details and consents */}
        {step === 3 && (
          <>
            <input className="w-full border p-2" name="taks" value={String(form.taks || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="kaks" value={String(form.kaks || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="emsal" value={String(form.emsal || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="gabari" value={String(form.gabari || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="hmax" value={String(form.hmax || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="katAdedi" value={String(form.katAdedi || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="cekmeMesafeleri" value={String(form.cekmeMesafeleri || '')} onChange={handleChange} />
            <input className="w-full border p-2" name="planNotlariText" value={String(form.planNotlariText || '')} onChange={handleChange} />

            <label className="block text-sm font-medium">Yol Durumu *</label>
            <select className={inputClass('roadAccess')} name="roadAccess" required value={String(form.roadAccess || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {roadAccessOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.roadAccess && <div className="text-sm text-red-600">{fieldErrors.roadAccess}</div>}

            <label className="block text-sm font-medium">Elektrik *</label>
            <select className={inputClass('electricity')} name="electricity" required value={String(form.electricity || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {utilityStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.electricity && <div className="text-sm text-red-600">{fieldErrors.electricity}</div>}

            <label className="block text-sm font-medium">Su *</label>
            <select className={inputClass('water')} name="water" required value={String(form.water || '')} onChange={handleChange}>
              <option value="">Seçiniz...</option>
              {utilityStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {fieldErrors.water && <div className="text-sm text-red-600">{fieldErrors.water}</div>}

            <input className="w-full border p-2" name="villageDistanceText" value={String(form.villageDistanceText || '')} onChange={handleChange} />

            <div className="mt-4 rounded border border-sky-200 bg-sky-50 p-3">
              <h3 className="text-sm font-semibold text-sky-900">Optional professional matching</h3>
              <p className="mt-1 text-xs text-sky-800 leading-relaxed">
                Bu mülk kaydını gelecekte profesyonel eşleştirme için kullanmamıza izin verebilirsiniz. Bu adım isteğe bağlıdır ve varsayılan olarak kayıt gizli kalır.
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
                <span>Bu mülk kaydının gelecekte isteğe bağlı profesyonel eşleştirme için kullanılmasına izin veriyorum.</span>
              </label>
              <label className="mt-2 flex items-start gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={allowProfessionalContact}
                  onChange={(e) => setAllowProfessionalContact(e.target.checked)}
                  disabled={!allowDealFlowMatching}
                  className="mt-1"
                />
                <span>Bu mülk kaydı hakkında bir uzmanın benimle iletişime geçmesine izin veriyorum.</span>
              </label>
              <p className="mt-2 text-xs text-slate-600">
                Varsayılan durum gizlidir. Bu onayı vermeden mülk kaydı oluşturabilirsiniz.
              </p>
            </div>
          </>
        )}

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="bg-gray-200 px-3 py-2 rounded" onClick={() => navigate('/dashboard')}>Panele dön</button>
          <button type="button" className="bg-gray-200 px-3 py-2 rounded" onClick={() => navigate('/dashboard')}>İptal</button>
          <button type="button" className="bg-amber-600 text-white px-3 py-2 rounded" onClick={() => persistDraft(form)}>Taslağı kaydet</button>
          <button type="button" className="bg-gray-300 px-3 py-2 rounded" disabled={step === 1} onClick={prevStep}>Geri</button>
          {step < TOTAL_STEPS ? (
            <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded" onClick={nextStep}>İleri</button>
          ) : (
            <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Kaydet ve Belgeler</button>
          )}
        </div>
      </form>
    </div>
  );
}
