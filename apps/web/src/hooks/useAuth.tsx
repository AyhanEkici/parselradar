// useAuth.tsx: now contains the AuthProvider and useAuth hooks with JSX support
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthContextType = { user: User };
const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>(null);
	useEffect(() => {
		getMe().then(u => setUser(u)).catch(() => setUser(null));
	}, []);
	return (
		<AuthContext.Provider value={{ user }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
