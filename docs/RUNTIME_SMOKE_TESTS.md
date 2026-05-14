
# ParselRadar Runtime Smoke Tests

This document describes the runtime smoke tests for the ParselRadar MVP.

## What is tested
- MongoDB connection
- API health
- Auth register/login/me/logout
- Credit ledger and dev-only credits
- Property submission
- Document upload (including Online İmar Durum Belgesi)
- Consent submission and Deal Pool eligibility
- Quick score and credit deduction
- Result preview (no fullAnalysis exposure)
- PDF purchase/generation and download
- Report download authorization
- Cross-user ownership protection
- Admin route protection
- Deal Pool consent separation
- Cleanup of all technical smoke test data

## How to run
1. Ensure MongoDB and the API server are running locally.
2. Set required env vars in `.env` (MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, etc).
3. Run:

```
npm run smoke
```

## Required env vars
- MONGODB_URI
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- (others as needed by the app)

## Cleanup guarantee
- All technical smoke test users, properties, and related data are deleted at the end of the test.
- No fake business data is seeded or left in the database.
- All smoke data is fully removed after test completion, including users, credits, properties, documents, consents, analysis runs, reports, deal pool entries, deal share audits, and generated PDF files.

## All runtime behaviors above are now tested and asserted by the smoke test suite.
