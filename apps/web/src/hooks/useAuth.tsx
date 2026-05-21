// useAuth.tsx — deterministic, loop-free auth hydration.
// Hydration runs ONCE on mount. The auth:changed event is only fired by
// setAuthSession (login) and explicit logout — never by 401 handling —
// so cross-tab sync cannot re-trigger a 401 storm.
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { getMe } from '../lib/auth';
import { AUTH_LOGIN_WRITE_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY, getAuthToken, getStoredUser, setAuthHydrating, assertStorageConsistency, hasAuthSession, clearAuthSession, isLoginWriteInProgress } from '../lib/authStorage';

type User = { id: string; email: string; name: string; role: string } | null;
type AuthState = 'booting' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'invalid';
type AuthContextType = { user: User; isAdmin: boolean; hydrating: boolean; authState: AuthState };
const AuthContext = createContext<AuthContextType>({
	user: null,
	isAdmin: false,
	hydrating: true,
	authState: 'booting',
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>(null);
	const [hydrating, setHydrating] = useState(true);
	const [authState, setAuthState] = useState<AuthState>('booting');
	const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
	// Incremented on every hydrateAuth call; stale async results are ignored.
	const callIdRef = useRef(0);

	async function hydrateAuth() {
		const callId = ++callIdRef.current;

		if (isLoginWriteInProgress()) {
			const hasPersistedSession = Boolean(getAuthToken() && getStoredUser());
			if (!hasPersistedSession) {
				return;
			}
		}

		// Always reconcile split storage before auth checks.
		assertStorageConsistency();

		// Guard: no token → clear state and stop. Do NOT call /auth/me.
		const token = getAuthToken();
		const storedUser = getStoredUser();
		if (!token) {
			if (callIdRef.current === callId) {
				setUser(null);
				setHydrating(false);
				setAuthState('unauthenticated');
			}
			return;
		}

		// If local storage already has a full session, keep UI authenticated while
		// /auth/me confirms server-side validity in the background.
		if (callIdRef.current === callId && storedUser) {
			setUser(storedUser as User);
			setAuthState('authenticated');
		}

		if (callIdRef.current === callId) {
			setHydrating(true);
			setAuthState('authenticating');
		}

		// Signal to apiFetch that it must NOT wipe the token on a transient 401.
		// We own the clear decision here, below.
		setAuthHydrating(true);
		try {
			const u = await getMe();
			if (callIdRef.current === callId) {
				setUser(u as User);
				setAuthState('authenticated');
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
					if (hasPersistedSession) {
						try {
							assertStorageConsistency();
							const retryUser = await getMe();
							if (callIdRef.current === callId) {
								setUser(retryUser as User);
								setAuthState('authenticated');
							}
							return;
						} catch (retryErr: unknown) {
							if ((retryErr as { status?: number })?.status !== 401 && storedUser && getAuthToken()) {
								setUser(storedUser as User);
								setAuthState('authenticated');
								return;
							}
						}
					}

					clearAuthSession('confirmed_auth_me_401');
					setUser(null);
					setAuthState('invalid');
				} else {
					if (storedUser && getAuthToken()) {
						setUser(storedUser as User);
						setAuthState('authenticated');
					} else {
						setUser(null);
						setAuthState('unauthenticated');
					}
				}
			}
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
		if (hydrating) return;
		if (isLoginWriteInProgress()) return;
		if (user) {
			assertStorageConsistency();
		}
		if (user && !hasAuthSession() && (authState === 'unauthenticated' || authState === 'invalid')) {
			setUser(null);
			setAuthState('unauthenticated');
		}
	}, [authState, hydrating, user]);

	return (
		<AuthContext.Provider value={{ user, isAdmin, hydrating, authState }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
