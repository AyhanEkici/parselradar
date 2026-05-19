import React, { useEffect, useState } from 'react';
import { getMe, logout } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import UserScopedNotice from '../components/UserScopedNotice';

interface User {
  name: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    getMe().then(setUser).catch(() => navigate('/login'));
    apiFetch('credits').then(r => setCredits(r.credits));
  }, [navigate]);

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Hoşgeldiniz, {user?.name}</h2>
      <UserScopedNotice />
      <div className="mb-2">Kredi bakiyesi: <b>{credits}</b></div>
      <div className="space-x-2 mt-4">
        <a href="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded">Yeni Mülk</a>
        <a href="/reports" className="bg-gray-200 px-4 py-2 rounded">Raporlarım</a>
        <a href="/credits" className="bg-gray-200 px-4 py-2 rounded">Kredi Yükle</a>
      </div>
      <button className="mt-8 text-red-600 underline" onClick={() => { logout(); navigate('/login'); }}>Çıkış Yap</button>
    </div>
  );
}
