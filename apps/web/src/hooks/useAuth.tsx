// useAuth.tsx — deterministic, loop-free auth hydration.
// Hydration runs ONCE on mount. The auth:changed event is only fired by
// setAuthSession (login) and explicit logout — never by 401 handling —
// so cross-tab sync cannot re-trigger a 401 storm.
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';
import { AUTH_LOGIN_WRITE_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY, getAuthToken, getStoredUser, setAuthHydrating, assertStorageConsistency, hasAuthSession, clearAuthSession, isLoginWriteInProgress } from '../lib/authStorage';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthStatus = 'booting' | 'checking' | 'authenticated' | 'unauthenticated' | 'invalid';
type LegacyAuthState = 'booting' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'invalid';
type AuthContextType = {
	user: User;
	isAdmin: boolean;
	authStatus: AuthStatus;
	isAuthenticated: boolean;
	hasPersistentSession: boolean;
	hydrating: boolean;
	authState: LegacyAuthState;
};
const AuthContext = createContext<AuthContextType>({
	user: null,
	isAdmin: false,
	authStatus: 'booting',
	isAuthenticated: false,
	hasPersistentSession: false,
	hydrating: true,
	authState: 'booting',
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>(null);
	const [authStatus, setAuthStatus] = useState<AuthStatus>('booting');
	const [hasPersistentSession, setHasPersistentSession] = useState<boolean>(false);
	const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
	const isAuthenticated = authStatus === 'authenticated' && Boolean(user);
	const hydrating = authStatus === 'booting' || authStatus === 'checking';
	const authState: LegacyAuthState = authStatus === 'checking' ? 'authenticating' : authStatus;
	// Incremented on every hydrateAuth call; stale async results are ignored.
	const callIdRef = useRef(0);

	async function hydrateAuth() {
		const callId = ++callIdRef.current;

		if (isLoginWriteInProgress()) {
			const hasPersistedSession = Boolean(getAuthToken() && getStoredUser());
			setHasPersistentSession(hasPersistedSession);
			if (!hasPersistedSession) {
				return;
			}
		}

		// Always reconcile split storage before auth checks.
		assertStorageConsistency();

		// Guard: no token → clear state and stop. Do NOT call /auth/me.
		const token = getAuthToken();
		const storedUser = getStoredUser();
		setHasPersistentSession(Boolean(token && storedUser));
		if (!token) {
			if (callIdRef.current === callId) {
				setUser(null);
				setAuthStatus('unauthenticated');
				setHasPersistentSession(false);
			}
			return;
		}

		// If local storage already has a full session, keep UI authenticated while
		// /auth/me confirms server-side validity in the background.
		if (callIdRef.current === callId && storedUser) {
			setUser(storedUser as User);
			setHasPersistentSession(true);
			setAuthStatus('checking');
		}

		if (callIdRef.current === callId) {
			setAuthStatus('checking');
		}

		// Signal to apiFetch that it must NOT wipe the token on a transient 401.
		// We own the clear decision here, below.
		setAuthHydrating(true);
		try {
			const u = await getMe();
			if (callIdRef.current === callId) {
				setUser(u as User);
				setHasPersistentSession(true);
				setAuthStatus('authenticated');
			}
		} catch (err: unknown) {
			// Only clear the stored token on a CONFIRMED 401 from the server.
			// Network errors (err.status undefined) or 5xx during cold-start
			// must NOT wipe a valid token — the user would be signed out
			// incorrectly after a hard refresh.
			const status = (err as { status?: number })?.status;
			if (callIdRef.current === callId) {
				if (status === 401) {
					const hasPersistedSession = Boolean(storedUser && getAuthToken());
					setHasPersistentSession(hasPersistedSession);
					if (hasPersistedSession) {
						try {
							assertStorageConsistency();
							const retryUser = await getMe();
							if (callIdRef.current === callId) {
								setUser(retryUser as User);
								setHasPersistentSession(true);
								setAuthStatus('authenticated');
							}
							return;
						} catch (retryErr: unknown) {
							if ((retryErr as { status?: number })?.status !== 401 && storedUser && getAuthToken()) {
								setUser(storedUser as User);
								setHasPersistentSession(true);
								setAuthStatus('authenticated');
								return;
							}
						}
					}

					clearAuthSession('confirmed_auth_me_401');
					setUser(null);
					setHasPersistentSession(false);
					setAuthStatus('invalid');
				} else {
					if (storedUser && getAuthToken()) {
						setUser(storedUser as User);
						setHasPersistentSession(true);
						setAuthStatus('checking');
					} else {
						setUser(null);
						setHasPersistentSession(false);
						setAuthStatus('unauthenticated');
					}
				}
			}
		} finally {
			setAuthHydrating(false);
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
		const handler = (event?: Event) => {
			if (event instanceof StorageEvent) {
				const key = event.key;
				if (key && key !== AUTH_TOKEN_KEY && key !== AUTH_USER_KEY && key !== AUTH_LOGIN_WRITE_KEY && key !== 'parselradar_last_clear_reason') {
					return;
				}
			}
			if (isLoginWriteInProgress()) return;
			assertStorageConsistency();
			hydrateAuth();
		};
		window.addEventListener('auth:changed', handler);
		window.addEventListener('storage', handler);
		return () => {
			window.removeEventListener('auth:changed', handler);
			window.removeEventListener('storage', handler);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Keep in-memory user during transient hydration or storage races.
	// Session clearing decisions are made only in hydrateAuth() on confirmed invalidation.
	useEffect(() => {
		if (authStatus === 'booting' || authStatus === 'checking') return;
		if (isLoginWriteInProgress()) return;
		if (user) {
			assertStorageConsistency();
		}
		if (user && !hasAuthSession() && (authStatus === 'unauthenticated' || authStatus === 'invalid')) {
			setUser(null);
			setHasPersistentSession(false);
			setAuthStatus('unauthenticated');
		}
	}, [authStatus, user]);

	return (
		<AuthContext.Provider value={{ user, isAdmin, authStatus, isAuthenticated, hasPersistentSession, hydrating, authState }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
