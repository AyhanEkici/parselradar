# DEPLOYED ADMIN TEST ACCOUNT RUNBOOK

## Purpose
Create, verify, and retire a controlled-beta admin smoke-test account in deployed environments without storing secrets in git.

## Scope
- Controlled beta operational testing only
- Not for public self-registration
- Not for production customer/admin onboarding

## Required Environment Variables
- MONGODB_URI
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_RESET_MODE (optional; `true` only when explicit password rotation/reset is required)

## Safe Command Pattern
Run from repository root with deployment/staging environment variables injected by secure secret store:

1. Validate required env variables are present in the active shell/runtime.
2. Execute:
   - `ts-node apps/api/scripts/seedAdmin.ts`

Optional npm shortcut (if available):
- `npm run admin:seed`

## Expected Behavior
- If admin does not exist: creates admin user with `role=ADMIN`.
- If admin exists and password matches: verifies and keeps account.
- If admin exists and password differs:
  - with `ADMIN_RESET_MODE=true`: rotates password hash
  - otherwise: leaves password unchanged and logs reset skipped

## Verification Steps
1. Confirm API auth route is healthy.
2. Login using the seeded admin test account at deployed login endpoint.
3. Verify admin-only route/page access is allowed.
4. Verify non-admin account is still denied for admin-only routes.

## Rotation and Removal
- After controlled beta smoke:
  1. Rotate admin test password (set new `ADMIN_PASSWORD`, run seed with `ADMIN_RESET_MODE=true`).
  2. Or remove/deactivate account directly via approved admin DB operations.
  3. Record who performed action, when, and why in operational log.

## Security Notes
- No hardcoded passwords in code or docs.
- No real secrets committed to git.
- Admin test account is for controlled beta only.
- Remove or rotate account promptly after test cycle.
- Never expose admin registration publicly.
- Keep `register` endpoint restricted to non-admin defaults (no role escalation via public registration).
