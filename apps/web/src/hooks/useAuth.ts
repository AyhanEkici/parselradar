import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthContextType = { user: User };
const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  useEffect(() => {
    getMe().then(u => setUser(u)).catch(() => setUser(null));
  }, []);
  return createContextElement(children, user);
}

function createContextElement(children: ReactNode, user: User) {
  // Avoid JSX: use React.createElement
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  return React.createElement(AuthContext.Provider, { value: { user } }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}
