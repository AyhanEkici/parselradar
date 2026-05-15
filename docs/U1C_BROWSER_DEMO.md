# U1-C Controlled Browser Demo Checklist

## 1. Required Terminals
- Terminal A: `npm run dev --prefix apps/api`
- Terminal B: `npm run dev --prefix apps/web`
- Terminal C: `stripe listen --forward-to http://localhost:4000/stripe/webhook` (must be run manually)

## 2. Browser URL
- http://localhost:3001

## API URL
- http://localhost:4000

## Notes
- Root URL "/" redirects to /login
- React Router future flag warnings are non-blocking warnings only

## 3. Controlled Pilot Test User
- Use a unique test email manually in browser.
- Do not add user to seed.
- Do not commit credentials.

## 4. Full Browser Flow
- Register
- Login
- Open Credits
- Buy 5 or 10 credits through Stripe Checkout
- Use Stripe test card: 4242 4242 4242 4242
- Any future expiry
- Any CVC
- Any postal code
- Return to app
- Confirm credits increased
- Create property
- Upload Online İmar Durum Belgesi or allowed test file
- Submit consent
- Run Quick Score
- Verify preview shows only:
  - signal
  - score
  - TL/m²
  - top risks
  - missing documents
  - recommended next action
  - locked PDF CTA
- Verify preview does NOT show:
  - fullAnalysis
  - full checklist
  - seller questions
  - source table
  - paid reasoning
- Purchase PDF report with credits
- Download PDF
- Verify PDF opens
- Login/admin check if available
- Confirm admin can see submission
- Confirm non-admin cannot access admin pages
- Optional Deal Pool opt-in check

## 5. Stop Conditions
- Stripe Checkout fails
- Webhook not received
- Credits do not update after webhook
- Upload fails
- Quick Score fails
- PDF purchase/download fails
- fullAnalysis exposed
- Admin page accessible to normal user
- Smoke fails

## 6. Manual Evidence to Capture
- checkout.session.completed seen in Stripe CLI
- credit balance before/after
- created property ID
- analysisRunId/reportId if visible
- PDF download success
- no fullAnalysis visible
- admin access behavior

## 7. Completion States
- U1-C AUTOMATED_PRECHECK_PASS
- U1-C MANUAL_BROWSER_CHECK_REQUIRED
- U1-C BROWSER_DEMO_PASS
- U1-C TRUE_HARD_BLOCKER
