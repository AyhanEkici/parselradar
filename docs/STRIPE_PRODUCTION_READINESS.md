# STRIPE PRODUCTION READINESS

## 1. Webhook Route Compatibility
- Ensure /stripe/webhook route is accessible from Stripe
- Use HTTPS endpoint in Stripe dashboard

## 2. Webhook Secret Placement
- Place STRIPE_LIVE_WEBHOOK_SECRET in production .env
- Never use test secret in production

## 3. Test/Live Mode Isolation
- Use test keys in local/staging
- Use live keys in production
- Never mix test and live keys

## 4. Replay Handling
- Stripe automatically retries failed events
- Ensure webhook handler is idempotent

## 5. Documentation
- Document how to create a live webhook in Stripe dashboard
- Document where to place secrets in deployment
- Remove all test price/product IDs from production docs
