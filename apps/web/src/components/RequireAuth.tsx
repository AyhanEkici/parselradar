import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, authStatus, hasPersistentSession } = useAuth();

  if (hasPersistentSession && (authStatus === 'booting' || authStatus === 'checking')) {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
  }

  if (authStatus === 'booting' || authStatus === 'checking') {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
  }

  if ((!user && !hasPersistentSession) || authStatus === 'unauthenticated' || authStatus === 'invalid') {
    return <Navigate to="/login" replace />;
  }

  if (!user && hasPersistentSession) {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
  }

  return <>{children}</>;
}
