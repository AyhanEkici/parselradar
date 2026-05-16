# DEPLOYMENT ENVIRONMENT MATRIX

| Environment   | Backend .env keys                | Frontend env keys         | Stripe Mode | Mongo Atlas URI         | Notes |
|---------------|----------------------------------|---------------------------|-------------|-------------------------|-------|
| local         | MONGODB_URI, JWT_SECRET, ...     | VITE_API_URL, CLIENT_URL  | test        | local/test DB           | Dev only |
| staging       | MONGODB_URI, JWT_SECRET, ...     | VITE_API_URL, CLIENT_URL  | test        | staging DB              | Optional |
| production    | MONGODB_URI, JWT_SECRET, ...     | VITE_API_URL, CLIENT_URL  | live        | production Atlas URI    | Real users |

## Backend .env keys
- MONGODB_URI
- JWT_SECRET
- CLIENT_URL
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NODE_ENV
- PORT

## Frontend env keys
- VITE_API_URL
- CLIENT_URL

## Stripe Separation
- Use test keys for local/staging
- Use live keys for production
- Never mix test/live keys

## Mongo Atlas
- Use separate clusters/URIs for each env
- Never use test DB in production
- Restrict access by IP and user role
