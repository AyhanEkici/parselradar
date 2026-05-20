// useAuth.tsx — deterministic, loop-free auth hydration.
// Hydration runs ONCE on mount. The auth:changed event is only fired by
// setAuthSession (login) and explicit logout — never by 401 handling —
// so cross-tab sync cannot re-trigger a 401 storm.
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';
import { getAuthToken, clearAuthSession, setAuthHydrating } from '../lib/authStorage';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthContextType = { user: User; isAdmin: boolean; hydrating: boolean };
const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, hydrating: true });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>(null);
	const [hydrating, setHydrating] = useState(true);
	const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
	// Incremented on every hydrateAuth call; stale async results are ignored.
	const callIdRef = useRef(0);

	async function hydrateAuth() {
		const callId = ++callIdRef.current;

		// Guard: no token → clear state and stop. Do NOT call /auth/me.
		const token = getAuthToken();
		if (!token) {
			if (callIdRef.current === callId) {
				setUser(null);
				setHydrating(false);
			}
			return;
		}

		if (callIdRef.current === callId) setHydrating(true);

		// Signal to apiFetch that it must NOT wipe the token on a transient 401.
		// We own the clear decision here, below.
		setAuthHydrating(true);
		try {
			const u = await getMe();
			if (callIdRef.current === callId) setUser(u as User);
		} catch (err: unknown) {
			// Only clear the stored token on a CONFIRMED 401 from the server.
			// Network errors (err.status undefined) or 5xx during cold-start
			// must NOT wipe a valid token — the user would be signed out
			// incorrectly after a hard refresh.
			const status = (err as { status?: number })?.status;
			if (status === 401) {
				clearAuthSession();
			}
			if (callIdRef.current === callId) setUser(null);
		} finally {
			setAuthHydrating(false);
			if (callIdRef.current === callId) setHydrating(false);
		}
	}

	// Boot hydration — runs once on mount.
	useEffect(() => {
		hydrateAuth();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Cross-tab login/logout sync. auth:changed is NEVER dispatched by 401
	// handling, so this cannot create a retry loop.
	useEffect(() => {
		const handler = () => hydrateAuth();
		window.addEventListener('auth:changed', handler);
		return () => window.removeEventListener('auth:changed', handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<AuthContext.Provider value={{ user, isAdmin, hydrating }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
