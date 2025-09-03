# Repository Overview: URLzy (MERN)

This document summarizes the project structure, major components, and key configuration to help automated tooling and maintainers navigate the codebase.

## Tech Stack

- Client: React + Vite + Tailwind CSS (Netlify deployment)
- Server: Node.js + Express + Mongoose (Render deployment)
- Database: MongoDB
- Caching/Rate limiting: Redis (ioredis)

## Top-level Structure

- /client: Frontend app
- /server: Backend API
- /.vscode: Editor settings
- /.zencoder/rules: Tooling metadata

## Server

- Entry: server/server.js

  - Middleware: CORS, Helmet, express-mongo-sanitize, JSON body parsing
  - Routes mounted:
    - / → server/routes/urls.js (API + redirects)
    - /api/auth → server/routes/auth.js
    - /api/billing→ server/routes/billing.js
  - Health: GET /health

- Models (server/models)

  - User.js: username, email, hashed password, role, verified
  - Url.js: originalUrl, shortCode, optional customCode, analytics inline, TTL index for expiresAt
  - ClickEvent.js: raw click events for aggregation (new)

- Routes

  - routes/urls.js:
    - POST /api/urls/shorten → create short URL (optional custom code)
    - GET /api/urls/list → list URLs for user or public
    - GET /:shortCode → redirect (now Redis-cached, async analytics)
    - GET /api/urls/:code → info for preview
    - DELETE /api/urls/:code → delete (with ownership checks)
  - routes/auth.js:
    - POST /register → create user and return JWT
    - POST /login → authenticate user and return JWT
    - GET /profile → get current user (Authorization: Bearer token)

- Middleware

  - middleware/auth.js: authenticate, optionalAuth, requireAdmin
  - middleware/validator.js: express-validator schemas
  - middleware/redisRateLimiter.js: Redis-backed limiter for anonymous shortens (new)

- Utilities

  - utils/shortCode.js: validation and generator for codes
  - utils/cache.js: Redis JSON get/set/del (new)

- Environment Variables (Render → server)
  - MONGODB_URI: MongoDB connection string
  - JWT_SECRET: secret for JWT signing (set a secure value in production)
  - CLIENT_URL: allowed CORS origins (comma-separated allowed)
  - BASE_URL: public base URL for building short links
  - REDIS_URL: Redis connection URL (Upstash/Redis Cloud)

## Client (Vite React)

- Config: client/src/config/api.js
  - API base URL: VITE_API_URL or http://localhost:5000
  - Endpoints: AUTH (/api/auth), SHORTEN, URLS, BILLING
- Auth Context: client/src/contexts/AuthContext.jsx
  - Handles login/register/logout, persists token in localStorage
- Pages: Home, Login, Register, Dashboard, Analytics, Pricing

## Deployment

- Client: Netlify (client/netlify.toml present)
- Server: Render
- Add Render Cron (optional) for nightly analytics aggregation later

## Recent Changes (Performance & Security)

- Redis caching for redirect route
- Redis-backed rate limiter for anonymous shortens
- Helmet + express-mongo-sanitize enabled
- ClickEvent model for future analytics rollups

## Known Improvements / TODOs

- Custom domain support (Domain model, resolve endpoint, Netlify Edge Function)
- DailyStats model + aggregation job
- Swagger/OpenAPI docs
- API keys and rate limiting per key
- 2FA and account security options

## Local Development

- Server: `cd server && npm install && npm run dev`
- Client: `cd client && npm install && npm run dev`
- Env files: client/.env (VITE_API_URL), server/.env (MONGODB_URI, JWT_SECRET, CLIENT_URL, BASE_URL, REDIS_URL)
