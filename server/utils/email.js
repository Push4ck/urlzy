// server/utils/email.js
// Simple email sender using nodemailer with SMTP (free via Gmail App Password or other SMTP)
// Falls back to console logging if not configured

const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT
  ? parseInt(process.env.SMTP_PORT, 10)
  : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || smtpUser || "no-reply@example.com";

  // If not configured, log to console so local/dev still works
  if (!t) {
    console.log("[DEV EMAIL] To:", to);
    console.log("[DEV EMAIL] Subject:", subject);
    console.log("[DEV EMAIL] Text:", text);
    return { devLogged: true };
  }

  await t.sendMail({ from, to, subject, text, html });
  return { sent: true };
}

module.exports = { sendEmail };
