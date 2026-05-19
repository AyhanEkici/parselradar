import React from 'react';
import RoleGate from './RoleGate';

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RoleGate allow="admin">{children}</RoleGate>;
}
