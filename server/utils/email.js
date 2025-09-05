// server/utils/email.js
// Production-ready email sender using nodemailer with SMTP
// - Verifies transporter on startup/use
// - Uses connection pooling and timeouts
// - Falls back to console logging only in non-production environments

const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecureEnv = (process.env.SMTP_SECURE || "").toLowerCase();
const isProd = (process.env.NODE_ENV || "development") === "production";

// If SMTP_SECURE provided, honor it; otherwise infer from port 465
const smtpSecure =
  smtpSecureEnv === "true"
    ? true
    : smtpSecureEnv === "false"
    ? false
    : smtpPort === 465;

let transporter = null;
let transporterReady = false;
let lastVerifyError = null;

function buildTransporter() {
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for others (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000, // 10s
    socketTimeout: 10000, // 10s
    // In development, allow self-signed/local certs; in production, enforce default verification
    tls: isProd ? undefined : { rejectUnauthorized: false },
  });
}

async function initEmail() {
  // Ensure required config exists
  if (!smtpHost || !smtpUser || !smtpPass) {
    transporter = null;
    transporterReady = false;
    lastVerifyError = new Error(
      "SMTP not fully configured (missing host/user/pass)"
    );
    return false;
  }

  try {
    if (!transporter) transporter = buildTransporter();
    // Verify connection configuration
    await transporter.verify();
    transporterReady = true;
    lastVerifyError = null;
    return true;
  } catch (err) {
    transporterReady = false;
    lastVerifyError = err;
    throw err;
  }
}

function isEmailConfigured() {
  return transporterReady;
}

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || smtpUser || "pushkarscode@gmail.com";

  console.log("[EMAIL DEBUG] Attempting to send email to:", to);
  console.log("[EMAIL DEBUG] Transporter ready:", transporterReady);

  // Lazy-init and verify transporter on first use
  try {
    if (!transporterReady) {
      console.log("[EMAIL DEBUG] Initializing email service...");
      await initEmail();
      console.log("[EMAIL DEBUG] Email service initialized successfully");
    }
  } catch (e) {
    console.error("[EMAIL DEBUG] Email init failed:", e.message);
    // In non-production, log to console to keep local/dev flows unblocked
    if (!isProd) {
      console.log("[DEV EMAIL] To:", to);
      console.log("[DEV EMAIL] Subject:", subject);
      console.log("[DEV EMAIL] Text:", text);
      return { devLogged: true };
    }
    // In production, fail loudly so the API can respond appropriately
    throw new Error(
      "Email service not ready: " + (e?.message || "unknown error")
    );
  }

  // Attempt send with a single quick retry on transient errors
  const transientCodes = new Set([
    "ETIMEDOUT",
    "ECONNECTION",
    "ESOCKET",
    "EAI_AGAIN",
  ]);

  // Check if transporter is available
  if (!transporter) {
    if (!isProd) {
      console.log("[DEV EMAIL] To:", to);
      console.log("[DEV EMAIL] Subject:", subject);
      console.log("[DEV EMAIL] Text:", text);
      return { devLogged: true };
    }
    throw new Error("Email service not configured");
  }

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    if (transientCodes.has(err?.code)) {
      // brief backoff then retry once
      await new Promise((r) => setTimeout(r, 300));
      await transporter.sendMail({ from, to, subject, text, html });
      return { sent: true, retried: true };
    }
    // For auth failures or invalid config, bubble up
    throw err;
  }
}

module.exports = {
  sendEmail,
  initEmail,
  isEmailConfigured,
  getLastEmailError: () => lastVerifyError,
};
