# LIVE BROWSER MVP PROOF BUNDLE

Generated at: 2026-05-21T11:49:30.000Z
Overall status: PASS
Commit: 52a7c68d

## Required Proofs

- real browser pilot login proof: PASS
  - Pilot admin login validated on https://parselradar.vercel.app/login with redirect to /dashboard and authenticated shell visible.

- Ctrl+F5 persistence proof: PASS
  - Authenticated app shell persisted through refresh behavior without forced logout redirect.

- back/forward navbar proof: PASS
  - Back/forward navigation across organizations and notifications retained app shell and avoided login fallback.

- admin nav route click proof: PASS
  - Verified route traversal for Audit, Users, Analyses, Credit Ledger, Stripe Sessions, Properties, Runtime, Deployment, Observability, Analytics, Connectors, Investor, Saved, Watchlist, Portfolio, Organizations, Notifications.

- no logout-on-nav-click proof: PASS
  - Authenticated shell and logout control remained visible during route traversal.

- no /auth/me 401 storm proof: PASS
  - Instrumented run observed no /auth/me retry loop storm; single-sample 401 did not cascade into repeated /auth/me churn.

- Mahir isolation proof: PASS
  - Live role/isolation verification confirms Mahir is USER and USER isolation controls remain enforced.

- Ayhan admin proof: PASS
  - Live role verification confirms Ayhan is ADMIN.

- route wiring audit proof: PASS
  - verify:mvp-wiring reports PASS and confirms route wiring integrity after AppShell centralization.

- AppShell proof: PASS
  - Single authenticated shell is active in apps/web/src/components/AppShell.tsx and applied through App.tsx.

- deployment-truth proof: PASS
  - local/origin/railway aligned at 52a7c68d547239851c43f674c320300cccffb81f; active Vercel bundle index-BkD73_Zv.js.

## Runtime Artifact

- proof/live-browser-mvp-runtime.json
