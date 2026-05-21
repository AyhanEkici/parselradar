# Navigation Persistence

Overall status: PASS

## Checks
- PASS - Protected routes use RequireAuth wrappers: Navigation safety must come from route wrappers, not page-local redirects.
- PASS - Dashboard internal navigation uses Link: Internal route transitions should avoid full page reload.
- PASS - AppShell nav uses router links: Navbar routing should remain client-side and consistent.
- PASS - Runtime CTRL+F5 persistence: ctrlf5_1: path=/dashboard, logoutVisible=true, navCount=17, tokenExists=true, userExists=true, loginBounceWithToken=false, hiddenNavbarWithToken=false | ctrlf5_2: path=/dashboard, logoutVisible=true, navCount=17, tokenExists=true, userExists=true, loginBounceWithToken=false, hiddenNavbarWithToken=false | ctrlf5_3: path=/dashboard, logoutVisible=true, navCount=17, tokenExists=true, userExists=true, loginBounceWithToken=false, hiddenNavbarWithToken=false
- PASS - Runtime back/forward persistence: history_back: path=/audit, logoutVisible=true, navCount=17, tokenExists=true, userExists=true, loginBounceWithToken=false, hiddenNavbarWithToken=false | history_forward: path=/admin/connector-detail, logoutVisible=true, navCount=17, tokenExists=true, userExists=true, loginBounceWithToken=false, hiddenNavbarWithToken=false | finalPath=/admin/connector-detail | historyStartPath=/admin/connector-detail
- PASS - Runtime protected route traversal persistence: Audit:PASS:/admin/audit-timeline | Users:PASS:/admin/users | Analyses:PASS:/admin/analyses | Credit Ledger:PASS:/admin/credit-ledger | Stripe Sessions:PASS:/admin/stripe-sessions | Properties:PASS:/admin/properties | Runtime:PASS:/admin/runtime | Deployment:PASS:/admin/deployment | Observability:PASS:/admin/observability | Analytics:PASS:/admin/analytics | Connectors:PASS:/admin/connectors | Investor:PASS:/investor | Saved:PASS:/investor/saved-analyses | Watchlist:PASS:/investor/watchlist | Portfolio:PASS:/investor/portfolio | Organizations:PASS:/organizations | Notifications:PASS:/notifications | /dashboard:PASS:/dashboard | /reports:PASS:/reports | /credits:PASS:/credits | /property/new:PASS:/property/new | /documents:PASS:/documents | /settings:PASS:/settings | /audit:PASS:/audit | /admin/connector-detail:PASS:/admin/connector-detail
- PASS - Runtime has no /login bounce with token: none

