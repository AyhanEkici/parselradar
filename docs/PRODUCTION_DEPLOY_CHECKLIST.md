
# PRODUCTION DEPLOYMENT CHECKLIST

## Required Environment Variables
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (secure random string)
- `CLIENT_URL` (frontend URL, e.g. https://parselradar.com)
- `STRIPE_SECRET_KEY` (from Stripe dashboard)
- `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard)
- `PORT` (optional, default 4000)

## Stripe Webhook Setup
- In Stripe dashboard, add webhook endpoint: `https://<your-backend>/stripe/webhook`
- Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- Ensure backend is publicly reachable by Stripe
- Test webhook delivery in Stripe dashboard

## MongoDB Atlas Setup
- Use a dedicated production cluster
- Whitelist backend server IPs
- Enable daily backups
- Enable 2FA and IP access controls
- Monitor cluster health

## Vercel Frontend Environment Variables
- `VITE_API_URL` = backend API URL (e.g. https://api.parselradar.com)
- `CLIENT_URL` = frontend URL (e.g. https://parselradar.com)


## Backend Hosting
- Use HTTPS (TLS cert required for all endpoints)
- Set all required envs in deployment config
- Use a process manager (pm2, systemd, etc.)
- Monitor logs and health endpoints
- Restrict SSH and admin access
- **Manual follow-up:** Ensure all authentication cookies are set with `secure: true` and `sameSite: 'strict'` in production. Review all cookie usage in auth/session flows for compliance.

## HTTPS Requirements
- TLS certificate (Let's Encrypt or commercial CA)
- Redirect all HTTP to HTTPS

## Production Smoke Checklist
- `/health` returns 200 and includes `X-Request-Id` header
- Login works (user and admin)
- Admin pages accessible and paginated
- Quick-score/analysis works
- Stripe checkout session creation works
- No stack traces or secrets in API error responses

## Rollback Instructions
- Use last restorepoint tag (e.g. `restorepoint-production-hardening-green`)
- `git checkout <tag>`
- Redeploy backend and frontend

## Additional Notes
- Never commit secrets or .env files
- Always validate all envs at startup (fail fast)
- All logs should include requestId for traceability
