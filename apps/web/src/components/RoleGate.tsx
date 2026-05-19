import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type RoleGateProps = {
  allow: 'admin' | 'user';
  children: React.ReactNode;
};

export default function RoleGate({ allow, children }: RoleGateProps) {
  const { user, isAdmin } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allow === 'admin' && !isAdmin) return <Navigate to="/access-denied" replace />;
  return <>{children}</>;
}
