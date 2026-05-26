import React, { useState } from 'react';
import { register } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError((err as { error?: string }).error || 'KayÄ±t baÅŸarÄ±sÄ±z');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">KayÄ±t Ol</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" P2_1C_TRIAGED_BACKLOG="Ad Soyad" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full border p-2" P2_1C_TRIAGED_BACKLOG="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" P2_1C_TRIAGED_BACKLOG="Åžifre" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">KayÄ±t Ol</button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-blue-600">GiriÅŸ Yap</a>
      </div>
    </div>
  );
}
