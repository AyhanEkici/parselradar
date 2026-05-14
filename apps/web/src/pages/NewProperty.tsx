import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface PropertyForm {
  [key: string]: string | number | undefined;
}

export default function NewProperty() {
  const [form, setForm] = useState<PropertyForm>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const property = await apiFetch('properties', { method: 'POST', body: JSON.stringify(form) });
      navigate(`/properties/${property._id}/documents`);
    } catch (err) {
      setError((err as { error?: string }).error || 'Kayıt başarısız');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Yeni Mülk</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input className="w-full border p-2" name="assetType" placeholder="Varlık Türü" onChange={handleChange} />
        <input className="w-full border p-2" name="inputMethod" placeholder="Giriş Yöntemi" onChange={handleChange} />
        <input className="w-full border p-2" name="ilanUrl" placeholder="İlan URL" onChange={handleChange} />
        <input className="w-full border p-2" name="il" placeholder="İl" onChange={handleChange} />
        <input className="w-full border p-2" name="ilce" placeholder="İlçe" onChange={handleChange} />
        <input className="w-full border p-2" name="mahalleOrKoy" placeholder="Mahalle/Köy" onChange={handleChange} />
        <input className="w-full border p-2" name="addressText" placeholder="Adres" onChange={handleChange} />
        <input className="w-full border p-2" name="askingPriceTRY" placeholder="Fiyat (TL)" type="number" onChange={handleChange} />
        <input className="w-full border p-2" name="areaM2" placeholder="Alan (m²)" type="number" onChange={handleChange} />
        <input className="w-full border p-2" name="ada" placeholder="Ada" onChange={handleChange} />
        <input className="w-full border p-2" name="parsel" placeholder="Parsel" onChange={handleChange} />
        <input className="w-full border p-2" name="pafta" placeholder="Pafta" onChange={handleChange} />
        <input className="w-full border p-2" name="nitelik" placeholder="Nitelik" onChange={handleChange} />
        <input className="w-full border p-2" name="tapuType" placeholder="Tapu Türü" onChange={handleChange} />
        <input className="w-full border p-2" name="zoningStatus" placeholder="İmar Durumu" onChange={handleChange} />
        <input className="w-full border p-2" name="taks" placeholder="TAKS" onChange={handleChange} />
        <input className="w-full border p-2" name="kaks" placeholder="KAKS" onChange={handleChange} />
        <input className="w-full border p-2" name="emsal" placeholder="Emsal" onChange={handleChange} />
        <input className="w-full border p-2" name="gabari" placeholder="Gabari" onChange={handleChange} />
        <input className="w-full border p-2" name="hmax" placeholder="Hmax" onChange={handleChange} />
        <input className="w-full border p-2" name="katAdedi" placeholder="Kat Adedi" onChange={handleChange} />
        <input className="w-full border p-2" name="cekmeMesafeleri" placeholder="Çekme Mesafeleri" onChange={handleChange} />
        <input className="w-full border p-2" name="planNotlariText" placeholder="Plan Notları" onChange={handleChange} />
        <input className="w-full border p-2" name="roadAccess" placeholder="Yol Durumu" onChange={handleChange} />
        <input className="w-full border p-2" name="electricity" placeholder="Elektrik" onChange={handleChange} />
        <input className="w-full border p-2" name="water" placeholder="Su" onChange={handleChange} />
        <input className="w-full border p-2" name="villageDistanceText" placeholder="Köy Mesafesi" onChange={handleChange} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Kaydet ve Belgeler</button>
      </form>
    </div>
  );
}
