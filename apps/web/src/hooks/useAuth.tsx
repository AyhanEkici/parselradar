// useAuth.tsx: now contains the AuthProvider and useAuth hooks with JSX support
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';
import { cleanupInvalidAuthState, deterministicAuthBootstrap } from '../security/deterministicAuthBootstrap';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthContextType = { user: User; isAdmin: boolean };
const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>(null);
	const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
	const refreshAuth = () => {
		getMe()
			.then((u) => setUser(u))
			.catch(() => {
				cleanupInvalidAuthState();
				setUser(null);
			});
	};
	useEffect(() => {
		deterministicAuthBootstrap();
		refreshAuth();
	}, []);
	// Listen for login/logout in other tabs
	useEffect(() => {
		const handler = () => {
			refreshAuth();
		};
		window.addEventListener('storage', handler);
		window.addEventListener('auth:changed', handler as EventListener);
		return () => {
			window.removeEventListener('storage', handler);
			window.removeEventListener('auth:changed', handler as EventListener);
		};
	}, []);
	return (
		<AuthContext.Provider value={{ user, isAdmin }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
