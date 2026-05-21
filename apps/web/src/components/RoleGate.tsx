import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAuthSession } from '../lib/authStorage';

type RoleGateProps = {
  allow: 'admin' | 'user';
  children: React.ReactNode;
};

export default function RoleGate({ allow, children }: RoleGateProps) {
  const { user, isAdmin, hydrating, authState } = useAuth();
  const hasSession = hasAuthSession();

  if (hydrating || hasSession || authState === 'authenticating' || authState === 'booting') {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum doğrulanıyor...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allow === 'admin' && !isAdmin) return <Navigate to="/access-denied" replace />;
  return <>{children}</>;
}
