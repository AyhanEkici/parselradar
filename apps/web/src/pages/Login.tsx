import React, { useState } from 'react';
import { login } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

type LoginResponse = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  token?: string;
  error?: string;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = (await login(email.trim(), password)) as LoginResponse;

      if (!res?.id || !res?.email || !res?.role || !res?.token) {
        setError(res?.error || 'Giriş başarısız');
        return;
      }

      localStorage.setItem('parselradar_token', res.token);
      window.dispatchEvent(new Event('storage'));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError((err as { error?: string; message?: string }).error || 'Giriş başarısız');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Giriş Yap</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <div className="text-red-600">{error}</div>}

        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/register" className="text-blue-600">
          Kayıt Ol
        </a>
      </div>
    </div>
  );
}