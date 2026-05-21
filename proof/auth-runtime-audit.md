# AUTH RUNTIME AUDIT

Overall status: FAIL

Failing auth defects:
- pilot login reaches /dashboard but collapses to /login on reload cycle 2
- auth keys remain present while backend returns TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- reload does not preserve authenticated session
- back/forward does not keep authenticated app shell
- protected route traversal falls back to /login after /auth/me invalidation

Blockers:
- Ayhan real browser credential unavailable in-session
- Mahir real browser credential unavailable in-session

Evidence:
- pilot login state: /dashboard with token/user persisted in local+session storage
- reload cycle 3 state: /login, last clear reason confirmed_auth_me_401
- /auth/me sampled: total=16, 401=14, code=TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT
- password invalidation trace: iatMs=1779377791000, passwordChangedAtMs=1779377793297, deltaMs=2297, skewMs=10000
- second normal login changed passwordChangedAt (unexpected): 2026-05-21T15:36:33.297Z -> 2026-05-21T15:36:34.075Z
