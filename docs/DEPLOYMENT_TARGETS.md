# DEPLOYMENT TARGETS

## Frontend (Vercel)
- Set VITE_API_URL to backend API URL in Vercel dashboard
- Set CLIENT_URL to frontend URL
- Build command: npm run build --prefix apps/web
- Output directory: apps/web/dist
- Health check: / (should load login page)

## Backend (Render/Railway/Fly.io)
- Set all backend .env variables in provider dashboard
- Build command: npm run build --prefix apps/api
- Start command: npm start --prefix apps/api
- Health check: /health (should return 200)
- Expose port 4000 (or set PORT env)

## General Notes
- Never commit .env files
- Always use production NODE_ENV in production
- Monitor logs and health endpoints
- Use restorepoint tags for safe rollback
