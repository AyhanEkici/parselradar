# SYNTHETIC BETA QA REPORT

## Scope
- Phase: P2.SYNTHETIC-QA-1
- Method: agent-driven synthetic QA in live deployed environment
- Environment: web `https://parselradar.vercel.app`, API `https://parselradar-production.up.railway.app`
- Session type: no code/feature changes; runtime behavior verification only

## Disclosure
- This report is generated from synthetic QA execution by an AI agent.
- This report does not contain human beta tester feedback.
- Findings are based on observed UI states, route behavior, and runtime responses only.

## Guardrails Applied
- No `.env` edits.
- No secret values printed in logs or docs.
- No fake official/legal/tapu/zoning verification claims.
- No SMTP/DNS launch gate bypass claims.
- Public launch status remains unchanged (`NOT_READY`).

## Build and Preflight
- `npm run build --prefix apps/web`: PASS
- `npm run build --prefix apps/api`: PASS
- Auth env gate for synthetic run: PASS (`AUTH_ENV_PRESENT`)
- API generated artifacts restored after build check: DONE

## Executed Coverage

### Public and mobile (logged out)
- Homepage loads with controlled-beta and informational-only disclosure language.
- `/login` and `/register` load and render form controls.
- Mobile viewport check (`390x844`) on homepage: render PASS.

### Authenticated user/admin flow
- Login with configured pilot credentials: PASS.
- Dashboard: PASS.
- New property form (`/properties/new`): PASS (form controls and stepper visible).
- Existing property detail (`/properties/6a10df4a807798e5958753cf`): PASS.
- Property documents (`/properties/6a10df4a807798e5958753cf/documents`): PASS.
- Property result (`/properties/6a10df4a807798e5958753cf/result`): PASS.
- Reports (`/reports`): PASS.

### Document upload simulation (synthetic)
- Dummy local files queued successfully (no sensitive files used).
- Queue metadata controls visible and editable:
  - evidence type suggestion
  - source type suggestion
  - metadata status suggestion
- Supporting-evidence-only controls present.
- Upload queue state and readiness indicators render correctly.
- No production data mutation was required for this verification step.

### Admin surfaces
- Admin CMS (`/admin/cms`): PASS.
- Admin Analysis Reports (`/admin/analysis-reports`): PASS (surface loads; async registry still loading during observation window).
- Admin Deal-Flow (`/admin/deal-flow`): PASS (empty-state and consent boundaries visible).

### Credits, Stripe-safe state, map/geo honesty
- Credits page (`/credits`): PASS (credit controls visible; boundary language present).
- Map preview (`/map`): PASS.
- Map diagnostics disclose unavailable providers / zero overlays explicitly.
- No false claim of live official TKGM/TUCBS/CSB integrated verification observed.

### Route guards and edge cases
- Logout + direct navigation to protected routes (`/dashboard`, `/admin/cms`, `/map`): redirected to `/login` (PASS).
- Unknown route while logged out (`/does-not-exist`): redirected to `/login` (observed behavior).
- Invalid property id while logged in (`/properties/000000000000000000000000`): user-facing "Mulk bulunamadi" state shown (PASS graceful error state).

## Findings (Synthetic)

### Confirmed non-blocking issues
1. `P3_POLISH` - Login helper copy contains non-Turkish text (`Wachtwoord vergeten?`) on Turkish login screen.
2. `P3_POLISH` - Intermittent `net::ERR_ABORTED` requestFailed events observed during route transitions; target pages still loaded.
3. `P3_POLISH` - Unknown route currently redirects to login (guard-first behavior) instead of explicit public 404 view.

## P3 Closeout (P2.SYNTHETIC-QA-1B)

1. Login helper copy locale inconsistency
- status: FIXED
- action: Login helper text standardized to Turkish (`Sifremi unuttum`) on the login surface.
- reason: UX copy consistency improvement only; no auth behavior or API logic changes.

2. Transition `requestFailed net::ERR_ABORTED` during navigation
- status: ACCEPTED
- action: No code change.
- reason: Observed as transition-time browser/request noise while target pages render successfully; no reproducible functional failure.

3. Logged-out unknown route redirects to login
- status: ACCEPTED
- action: No code change.
- reason: Current guard-first routing behavior is intentional and kept to avoid auth-guard risk during controlled beta.

### No new blockers observed
- No `P0_BLOCKER` found.
- No `P1_FLOW_BLOCKER` found.

## Classification
- Synthetic QA outcome: PASS_WITH_P3_CLOSED
- Controlled beta recommendation: `READY_FOR_CONTROLLED_BETA_CONTINUATION`
- Public launch recommendation: remain `NOT_READY`

## Required Follow-up
1. Keep controlled beta running with monitoring and small tester count.
2. Keep accepted P3 items monitored in issue ledger during real tester onboarding.
3. Continue real-tester onboarding and collect human feedback separately.
4. Keep SMTP/DNS/secret-rotation launch blockers unchanged until proven with operator evidence.

## Blocker Confirmation
- No `P0_BLOCKER` remains.
- No `P1_FLOW_BLOCKER` remains.
- No `P2_PRODUCT_ISSUE` was introduced by this closeout.
