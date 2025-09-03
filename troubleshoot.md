# OTP Email Setup Quick Troubleshoot

- Ensure server env vars are set:
  - MONGODB_URI, JWT_SECRET, CLIENT_URL, BASE_URL
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM (optional; otherwise emails are logged)
  - OTP_LENGTH, OTP_TTL_MINUTES, OTP_RESEND_SECONDS
- Local dev: copy server/.env.example to server/.env and fill values.
- Netlify client env: VITE_API_URL pointing to your server URL.
- Render server env: set SMTP*\* and OTP*\* vars.
- 403 on login with requiresVerification: go to /verify-email and complete verification.
- 2FA: toggle via POST /api/auth/2fa/enable (requires auth); verify OTP at /login-verify.
