import React, { useState } from 'react';
import { login } from '../lib/auth';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res && res.id && res.email && res.name && res.role) {
        // set user state in AuthProvider by reloading getMe
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else {
        setError('Giriş başarısız');
      }
    } catch (err) {
      setError((err as { error?: string }).error || 'Giriş başarısız');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Giriş Yap</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Giriş Yap</button>
      </form>
      <div className="mt-4 text-center">
        <a href="/register" className="text-blue-600">Kayıt Ol</a>
      </div>
    </div>
  );
}
