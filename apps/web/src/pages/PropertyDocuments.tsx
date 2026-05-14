import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { apiFetch } from '../lib/api';

const docTypes = [
  { key: 'ONLINE_IMAR_DURUM_BELGESI', label: 'Online İmar Durum Belgesi' },
  { key: 'BELEDIYE_IMAR_DURUM_BELGESI', label: 'Belediye İmar Durum Belgesi' },
  { key: 'TAPU_SENEDI', label: 'Tapu Senedi' },
  { key: 'TAKYIDAT_BELGESI', label: 'Takyidat Belgesi' },
  { key: 'TKGM_PARSEL_SCREENSHOT', label: 'TKGM Parsel Sorgu Screenshot' },
  { key: 'E_IMAR_SCREENSHOT', label: 'E-İmar Screenshot' },
  { key: 'ILAN_SCREENSHOT', label: 'İlan Screenshot' },
  { key: 'PLAN_NOTLARI', label: 'Plan Notları' },
  { key: 'RUHSAT', label: 'Ruhsat' },
  { key: 'ISKAN', label: 'İskan' },
  { key: 'KAT_IRTIFAKI_TAPUSU', label: 'Kat İrtifakı Tapusu' },
  { key: 'KAT_MULKIYETI_TAPUSU', label: 'Kat Mülkiyeti Tapusu' },
  { key: 'TAPU_KAYIT_BELGESI', label: 'Tapu Kayıt Belgesi' },
  { key: 'OTHER', label: 'Diğer' },
];

export default function PropertyDocuments() {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const formData = new FormData(e.currentTarget);
    try {
      await fetch(`/properties/${id}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      setSuccess('Yüklendi');
    } catch {
      setError('Yükleme başarısız');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Belge Yükle</h2>
      <ul className="mb-4">
        {docTypes.map(dt => (
          <li key={dt.key} className="mb-2">
            <form onSubmit={handleUpload} className="flex items-center space-x-2">
              <input type="hidden" name="documentType" value={dt.key} />
              <span className="w-56">{dt.label}</span>
              <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required />
              <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Yükle</button>
            </form>
          </li>
        ))}
      </ul>
      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="mt-4 flex space-x-2">
        <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => navigate(`/properties/${id}/consent`)}>Devam: Açık Rıza</button>
        <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => navigate(`/properties/${id}/result`)}>Sonuç</button>
      </div>
    </div>
  );
}
