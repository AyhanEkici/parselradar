import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function PropertyDetail() {
  const { id } = useParams();
  interface Property {
    _id: string;
    addressText: string;
    il: string;
    ilce: string;
    askingPriceTRY: number;
    areaM2: number;
    ada: string;
    parsel: string;
    zoningStatus: string;
    tapuType: string;
  }
  const [property, setProperty] = useState<Property | null>(null);
  useEffect(() => {
    apiFetch(`properties/${id}`).then(setProperty);
  }, [id]);
  if (!property) return <div className="text-center mt-20">Yükleniyor...</div>;
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Mülk Detayı</h2>
      <div className="mb-2">Adres: {property.addressText}</div>
      <div className="mb-2">İl: {property.il} / İlçe: {property.ilce}</div>
      <div className="mb-2">Fiyat: {property.askingPriceTRY} TL</div>
      <div className="mb-2">Alan: {property.areaM2} m²</div>
      <div className="mb-2">Ada/Parsel: {property.ada} / {property.parsel}</div>
      <div className="mb-2">İmar Durumu: {property.zoningStatus}</div>
      <div className="mb-2">Tapu Türü: {property.tapuType}</div>
      <div className="mt-4 space-x-2">
        <Link to={`/properties/${id}/documents`} className="bg-blue-600 text-white px-3 py-1 rounded">Belgeler</Link>
        <Link to={`/properties/${id}/consent`} className="bg-gray-200 px-3 py-1 rounded">Onaylar</Link>
        <Link to={`/properties/${id}/result`} className="bg-gray-200 px-3 py-1 rounded">Sonuç</Link>
      </div>
    </div>
  );
}
