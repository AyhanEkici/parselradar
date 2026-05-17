import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface PropertyForm {
  [key: string]: string | number | undefined;
}

export default function NewProperty() {
  const [form, setForm] = useState<PropertyForm>({});
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const property = await apiFetch('properties', { method: 'POST', body: JSON.stringify(clientFields) });
      navigate(`/properties/${property._id}/documents`);
    } catch (err) {
      const apiError = err as { error?: string; fields?: Record<string, string> };
      setError(apiError.error || 'Validation failed');
      setFieldErrors(apiError.fields || {});
    }
  };

  const inputClass = (name: string) =>
    `w-full border p-2 ${fieldErrors[name] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Yeni Mülk</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-sm font-medium">Varlık Türü *</label>
        <input className={inputClass('assetType')} name="assetType" placeholder="Varlık Türü" required onChange={handleChange} />
        {fieldErrors.assetType && <div className="text-sm text-red-600">{fieldErrors.assetType}</div>}

        <label className="block text-sm font-medium">Giriş Yöntemi *</label>
        <input className={inputClass('inputMethod')} name="inputMethod" placeholder="Giriş Yöntemi" required onChange={handleChange} />
        {fieldErrors.inputMethod && <div className="text-sm text-red-600">{fieldErrors.inputMethod}</div>}

        <input className="w-full border p-2" name="ilanUrl" placeholder="İlan URL" onChange={handleChange} />

        <label className="block text-sm font-medium">İl *</label>
        <input className={inputClass('il')} name="il" placeholder="İl" required onChange={handleChange} />
        {fieldErrors.il && <div className="text-sm text-red-600">{fieldErrors.il}</div>}

        <label className="block text-sm font-medium">İlçe *</label>
        <input className={inputClass('ilce')} name="ilce" placeholder="İlçe" required onChange={handleChange} />
        {fieldErrors.ilce && <div className="text-sm text-red-600">{fieldErrors.ilce}</div>}

        <label className="block text-sm font-medium">Mahalle/Köy *</label>
        <input className={inputClass('mahalleOrKoy')} name="mahalleOrKoy" placeholder="Mahalle/Köy" required onChange={handleChange} />
        {fieldErrors.mahalleOrKoy && <div className="text-sm text-red-600">{fieldErrors.mahalleOrKoy}</div>}

        <input className="w-full border p-2" name="addressText" placeholder="Adres" onChange={handleChange} />

        <label className="block text-sm font-medium">Fiyat (TL) *</label>
        <input className={inputClass('askingPriceTRY')} name="askingPriceTRY" placeholder="Fiyat (TL)" type="number" required onChange={handleChange} />
        {fieldErrors.askingPriceTRY && <div className="text-sm text-red-600">{fieldErrors.askingPriceTRY}</div>}

        <label className="block text-sm font-medium">Alan (m²) *</label>
        <input className={inputClass('areaM2')} name="areaM2" placeholder="Alan (m²)" type="number" required onChange={handleChange} />
        {fieldErrors.areaM2 && <div className="text-sm text-red-600">{fieldErrors.areaM2}</div>}

        <input className="w-full border p-2" name="ada" placeholder="Ada" onChange={handleChange} />
        <input className="w-full border p-2" name="parsel" placeholder="Parsel" onChange={handleChange} />
        <input className="w-full border p-2" name="pafta" placeholder="Pafta" onChange={handleChange} />
        <input className="w-full border p-2" name="nitelik" placeholder="Nitelik" onChange={handleChange} />

        <label className="block text-sm font-medium">Tapu Türü *</label>
        <input className={inputClass('tapuType')} name="tapuType" placeholder="Tapu Türü" required onChange={handleChange} />
        {fieldErrors.tapuType && <div className="text-sm text-red-600">{fieldErrors.tapuType}</div>}

        <label className="block text-sm font-medium">İmar Durumu *</label>
        <input className={inputClass('zoningStatus')} name="zoningStatus" placeholder="İmar Durumu" required onChange={handleChange} />
        {fieldErrors.zoningStatus && <div className="text-sm text-red-600">{fieldErrors.zoningStatus}</div>}

        <input className="w-full border p-2" name="taks" placeholder="TAKS" onChange={handleChange} />
        <input className="w-full border p-2" name="kaks" placeholder="KAKS" onChange={handleChange} />
        <input className="w-full border p-2" name="emsal" placeholder="Emsal" onChange={handleChange} />
        <input className="w-full border p-2" name="gabari" placeholder="Gabari" onChange={handleChange} />
        <input className="w-full border p-2" name="hmax" placeholder="Hmax" onChange={handleChange} />
        <input className="w-full border p-2" name="katAdedi" placeholder="Kat Adedi" onChange={handleChange} />
        <input className="w-full border p-2" name="cekmeMesafeleri" placeholder="Çekme Mesafeleri" onChange={handleChange} />
        <input className="w-full border p-2" name="planNotlariText" placeholder="Plan Notları" onChange={handleChange} />

        <label className="block text-sm font-medium">Yol Durumu *</label>
        <input className={inputClass('roadAccess')} name="roadAccess" placeholder="Yol Durumu" required onChange={handleChange} />
        {fieldErrors.roadAccess && <div className="text-sm text-red-600">{fieldErrors.roadAccess}</div>}

        <label className="block text-sm font-medium">Elektrik *</label>
        <input className={inputClass('electricity')} name="electricity" placeholder="Elektrik" required onChange={handleChange} />
        {fieldErrors.electricity && <div className="text-sm text-red-600">{fieldErrors.electricity}</div>}

        <label className="block text-sm font-medium">Su *</label>
        <input className={inputClass('water')} name="water" placeholder="Su" required onChange={handleChange} />
        {fieldErrors.water && <div className="text-sm text-red-600">{fieldErrors.water}</div>}

        <input className="w-full border p-2" name="villageDistanceText" placeholder="Köy Mesafesi" onChange={handleChange} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Kaydet ve Belgeler</button>
      </form>
    </div>
  );
}
