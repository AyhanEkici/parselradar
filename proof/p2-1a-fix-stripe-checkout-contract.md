# P2.1A-FIX Stripe Checkout Contract

- resolutionType: AUDIT_FALSE_POSITIVE_FIXED
- rootCause: audit mount parser missed wrapped stripe mount and reported a false missing endpoint.

## Frontend/Backend Contract
- frontend route/page: /credits
- frontend call: apiFetch('stripe/create-checkout-session')
- backend effective endpoint: POST /stripe/create-checkout-session
- auth/rate-limit: auth + stripeLimiter

## Request/Response
- request body: { creditAmount: 25 | 50 }
- success response: { url: string }
- failure responses: 400 invalid package, 500 missing price config, 503 Stripe unavailable

## Credit Safety
- credit grant trigger: checkout.session.completed webhook only
- failed/cancelled payment grants credits: no
- duplicate credit protection: yes (StripeCheckoutSession status must be non-PAID before fulfillment)

## Verification Evidence
- audit:mvp-completeness: PASS, score=93
- /credits P0 blocker still present: no
