import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrating, authState } = useAuth();

  if (hydrating || authState === 'booting' || authState === 'authenticating') {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
