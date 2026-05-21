# Browser History Consistency

Overall status: FAIL

## Checks
- PASS - Shell keeps nav mounted during auth boot states: History navigation should not collapse shell while auth settles.
- PASS - Protected pages are wrapped by RequireAuth: History transitions should be guarded centrally.
- FAIL - Runtime CTRL+F5 consistency: ctrlf5_1: path=/login, logoutVisible=false, navCount=0 | ctrlf5_2: path=/login, logoutVisible=false, navCount=0 | ctrlf5_3: path=/login, logoutVisible=false, navCount=0
- FAIL - Runtime browser back/forward consistency: history_back: path=blank, logoutVisible=false, navCount=0 | history_forward: path=/login, logoutVisible=false, navCount=0 | finalPath=/login | historyStartPath=/login
- PASS - Runtime auth/me stability under history actions: authMe status401=0

