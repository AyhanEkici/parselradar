# Auth Shell Consistency

Overall status: FAIL
Runtime proof source: proof/live-browser-mvp-runtime.json

## Checks
- PASS - App wraps routes in AppShell: App shell must remain mounted around route tree.
- PASS - AppShell derives auth from context: Navbar visibility must not infer auth from storage.
- PASS - AppShell keeps shell visible during boot/authenticating: Transient hydration must not collapse shell.
- PASS - Hydration marks auth phase boundaries: Hydration lifecycle must be explicit and deterministic.
- FAIL - Runtime pilot shell persistence: post_login: path=/dashboard, logoutVisible=false, navCount=0
- FAIL - Runtime CTRL+F5 shell persistence: ctrlf5_1: path=/login, logoutVisible=false, navCount=0 | ctrlf5_2: path=/login, logoutVisible=false, navCount=0 | ctrlf5_3: path=/login, logoutVisible=false, navCount=0
- PASS - Runtime auth/me storm bounded: authMe status401=0

