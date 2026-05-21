# RBAC INTEGRITY AUDIT

Overall status: FAIL

RBAC defects:
- runtime role-based shell visibility is not deterministic because authenticated shell collapses after login

RBAC blockers:
- Ayhan ADMIN real browser login not executable without valid credential in-session
- Mahir USER real browser login not executable without valid credential in-session

RBAC evidence:
- static verifier: PASS (57/57)
- backend role snapshot: Ayhan=ADMIN, Mahir=USER (from verify:admin-ux-email)
