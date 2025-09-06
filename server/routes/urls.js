const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const User = require("../models/User");
const {
  generateUniqueCode,
  isCustomCodeAvailable,
  isValidUrl,
} = require("../utils/shortCode");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { urlValidationRules, validate } = require("../middleware/validator");

// Redis-backed rate limiter and cache/analytics
const { anonShortenRateLimit } = require("../middleware/redisRateLimiter");
const cache = require("../utils/cache");
const ClickEvent = require("../models/ClickEvent");
const bcrypt = require("bcryptjs");

// Offline mode flag (use only for local development/testing)
const OFFLINE_MODE = process.env.ENABLE_OFFLINE === "true";

// In-memory store for offline mode (when MongoDB is not connected)
// Keyed by shortCode or customCode -> { originalUrl, createdAt, expiresAt, isPasswordProtected, passwordHash, _id }
const OFFLINE_URLS = new Map();

// GET /api/urls/list - List URLs (filtered by user if authenticated)
router.get("/api/urls/list", optionalAuth, async (req, res) => {
  try {
    // TEMPORARY: Mock response when database is not connected
    const mongoose = require("mongoose");
    if (OFFLINE_MODE && mongoose.connection.readyState !== 1) {
      console.log("🗄️  Database not connected - returning offline URL list");

      // Build a unique list from in-memory store (OFFLINE_URLS may have both keys)
      const unique = new Map();
      for (const rec of OFFLINE_URLS.values()) {
        unique.set(rec._id, rec);
      }
      const list = Array.from(unique.values()).map((u) => ({
        _id: u._id,
        originalUrl: u.originalUrl,
        shortCode: u.customCode || u.shortCode,
        customCode: u.customCode,
        clickCount: u.clickCount || 0,
        createdAt: u.createdAt,
        expiresAt: u.expiresAt || null,
      }));

      return res.json({
        success: true,
        data: list,
      });
    }

    let query = {};

    if (req.user) {
      // Authenticated user: show only their URLs
      query.userId = req.user._id;
    } else {
      // Anonymous user: show recent public URLs (limited)
      query.userId = null;
      query.expiresAt = { $gt: new Date() }; // Only non-expired
    }

    const urls = await Url.find(query)
      .select("originalUrl shortCode customCode clickCount createdAt expiresAt")
      .sort({ createdAt: -1 })
      .limit(req.user ? 1000 : 20); // More for authenticated users

    return res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    console.error("Error listing URLs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// POST /api/urls/shorten - Create short URL
router.post(
  "/api/urls/shorten",
  urlValidationRules(),
  validate,
  optionalAuth,
  anonShortenRateLimit,
  async (req, res) => {
    try {
      const { originalUrl, customCode, password } = req.body;

      // Clean up empty strings
      const cleanCustomCode =
        customCode && typeof customCode === "string" && customCode.trim()
          ? customCode.trim()
          : null;
      const cleanPassword =
        password && typeof password === "string" && password.trim()
          ? password.trim()
          : null;

      console.log("[DEBUG] Received request:", {
        originalUrl,
        customCode: cleanCustomCode ? "present" : "empty",
        password: cleanPassword ? "present" : "empty",
      });

      // Validate original URL
      if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });
      }

      // User tier restrictions
      if (!req.user) {
        // Anonymous users
        if (customCode) {
          return res.status(403).json({
            success: false,
            message: "Custom short codes require an account. Please log in.",
          });
        }
        if (cleanPassword) {
          return res.status(403).json({
            success: false,
            message: "Password protection requires an account. Please log in.",
          });
        }
      } else {
        // Logged in users
        const isPremium = req.user.premium || req.user.role === 'admin';

        // Free users cannot use password protection
        if (cleanPassword && !isPremium) {
          return res.status(403).json({
            success: false,
            message: "Password protection is a premium feature. Please upgrade to premium.",
          });
        }
      }

      // TEMPORARY: Mock response when database is not connected
      const mongoose = require("mongoose");
      if (OFFLINE_MODE && mongoose.connection.readyState !== 1) {
        console.log(
          "🗄️  Database not connected - using offline in-memory store"
        );

        // Generate a random short custom code for testing
        let shortCode;
        if (customCode) {
          shortCode = customCode;
        } else {
          // Generate a 4-6 character random code for offline mode
          const length = Math.floor(Math.random() * 3) + 4;
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          shortCode = '';
          for (let i = 0; i < length; i++) {
            shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        }
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const shortUrl = `${baseUrl}/${shortCode}`;

        // Optional password handling in offline mode
        let passwordHash = null;
        let isPasswordProtected = false;
        if (
          password &&
          typeof password === "string" &&
          password.trim().length > 0
        ) {
          const salt = await bcrypt.genSalt(10);
          passwordHash = await bcrypt.hash(password, salt);
          isPasswordProtected = true;
        }

        const record = {
          _id: `offline_${shortCode}`,
          originalUrl,
          shortCode,
          customCode: customCode || null,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isPasswordProtected,
          passwordHash,
          clickCount: 0,
        };

        // Save in-memory (key by both shortCode and customCode if present)
        OFFLINE_URLS.set(shortCode, record);
        if (customCode) OFFLINE_URLS.set(customCode, record);

        return res.status(201).json({
          success: true,
          data: {
            originalUrl,
            shortUrl,
            shortCode,
            createdAt: record.createdAt,
            expiresAt: record.expiresAt,
            isPasswordProtected,
          },
        });
      }

      // Check if URL already exists (for the same user or anonymous)
      // IMPORTANT: Only reuse an existing URL when no customCode is provided AND password protection matches.
      const userId = req.user ? req.user._id : null;
      let existingUrl = null;
      if (!customCode) {
        const hasPassword = password && typeof password === "string" && password.trim().length > 0;
        existingUrl = await Url.findOne({
          originalUrl,
          userId,
          expiresAt: { $gt: new Date() }, // Not expired
          isPasswordProtected: hasPassword, // Must match password protection status
        });
      }

      if (existingUrl) {
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const shortUrl = `${baseUrl}/${existingUrl.customCode}`;

        return res.json({
          success: true,
          data: {
            originalUrl: existingUrl.originalUrl,
            shortUrl,
            shortCode: existingUrl.customCode,
            createdAt: existingUrl.createdAt,
          },
        });
      }

      let shortCode;
      let finalCustomCode = null;

      // Handle custom code (normalized, reserved words prevented).
      const normalizedCustomCode = customCode?.trim().toLowerCase();
      if (normalizedCustomCode) {
        const isAvailable = await isCustomCodeAvailable(normalizedCustomCode);
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: "Custom code is not available",
          });
        }
        shortCode = normalizedCustomCode;
        finalCustomCode = normalizedCustomCode;
      } else {
        // Generate a random short custom code instead of using shortCode
        let randomCode;
        let attempts = 0;
        do {
          // Generate a 4-6 character random code
          const length = Math.floor(Math.random() * 3) + 4; // 4-6 characters
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          randomCode = '';
          for (let i = 0; i < length; i++) {
            randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          attempts++;
          if (attempts > 10) {
            // Fallback to regular shortCode generation if we can't find a unique custom code
            randomCode = await generateUniqueCode();
            break;
          }
        } while (!(await isCustomCodeAvailable(randomCode)));

        shortCode = randomCode;
        finalCustomCode = randomCode;
      }

      // Set expiration based on user type
      let expiresAt = null;
      let maxExpiryDays = 0;

      if (!req.user) {
        // Anonymous users: 3 days expiration
        expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        maxExpiryDays = 3;
      } else {
        const isPremium = req.user.premium || req.user.role === 'admin';

        if (!isPremium) {
          // Free logged-in users: 7 days expiration
          expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          maxExpiryDays = 7;
        } else {
          // Premium users: up to 30 days custom expiration
          if (req.body.expiresAt) {
            expiresAt = new Date(req.body.expiresAt);
            // Validate expiry is in the future (at least 1 minute from now)
            const minExpiry = new Date(Date.now() + 1 * 60 * 1000);
            // Validate expiry doesn't exceed 30 days for premium users
            const maxExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (expiresAt <= minExpiry) {
              return res.status(400).json({
                success: false,
                message: "Expiry must be at least 1 minute from now",
              });
            }
            if (expiresAt > maxExpiry) {
              return res.status(400).json({
                success: false,
                message: "Premium users can set expiry up to 30 days from now",
              });
            }
          } else {
            // Default to 30 days for premium users
            expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            maxExpiryDays = 30;
          }
        }
      }

      // Create URL document
      let passwordHash = null;
      let isPasswordProtected = false;
      if (
        password &&
        typeof password === "string" &&
        password.trim().length > 0
      ) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
        isPasswordProtected = true;
      }

      const urlData = {
        originalUrl,
        shortCode,
        userId: userId,
        expiresAt,
        isPasswordProtected,
        password: passwordHash,
      };

      // Set customCode to the final custom code (either user-provided or randomly generated)
      if (finalCustomCode) {
        urlData.customCode = finalCustomCode;
      }

      const url = new Url(urlData);

      await url.save();

      // If authenticated, increment user's urlsCreated counter
      if (userId) {
        try {
          await User.updateOne({ _id: userId }, { $inc: { urlsCreated: 1 } });
        } catch (e) {
          // Non-blocking: log but don't fail the request
          console.error("Failed to increment user's urlsCreated:", e);
        }
      }

      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      const shortUrl = `${baseUrl}/${finalCustomCode}`;

      res.status(201).json({
        success: true,
        data: {
          originalUrl,
          shortUrl,
          shortCode: finalCustomCode,
          createdAt: url.createdAt,
          expiresAt,
          isPasswordProtected,
        },
      });
    } catch (error) {
      console.error("Error in /shorten:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// GET /:shortCode - Redirect to original URL (cached + async analytics)
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // TEMPORARY: Mock response when database is not connected
    const mongoose = require("mongoose");
    if (OFFLINE_MODE && mongoose.connection.readyState !== 1) {
      console.log(`🔗 Offline redirect for: ${shortCode}`);

      const record = OFFLINE_URLS.get(shortCode);
      if (!record) {
        return res
          .status(404)
          .json({ success: false, message: "URL not found" });
      }

      if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
        return res
          .status(410)
          .json({ success: false, message: "URL has expired" });
      }

      if (record.isPasswordProtected) {
        const error =
          req.query && req.query.error
            ? "Invalid password. Please try again."
            : "";
        const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Password Required</title>
  <style>
    :root{--bg1:#eef2ff;--bg2:#e0f2fe;--primary:#4f46e5;--primary2:#6366f1;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--danger:#ef4444;}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 600px at -10% -10%, var(--bg2), transparent), radial-gradient(1200px 600px at 110% 110%, var(--bg1), transparent), #f8fafc;color:var(--text);font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";}
    .card{width:100%;max-width:480px;background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:0 25px 50px -20px rgba(2,6,23,.25);padding:32px;position:relative;overflow:hidden;}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--primary),var(--primary2));}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:12px}
    .logo{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;font-size:20px;}
    h1{font-size:1.5rem;line-height:1.3;margin:0;font-weight:700}
    p.lead{margin:.5rem 0 1.5rem 0;color:var(--muted);font-size:1.1rem}
    .alert{display:flex;align-items:flex-start;gap:10px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin:0 0 16px 0;font-size:1rem;border-left:4px solid var(--danger)}
    .alert-icon{font-size:18px;margin-top:1px}
    .form-group{margin-bottom:20px}
    label{display:block;font-weight:600;margin:0 0 8px 0;color:var(--text);font-size:1rem}
    .input-container{position:relative}
    .input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:18px}
    .input{width:100%;padding:14px 14px 14px 44px;border:1px solid var(--border);border-radius:14px;font-size:1rem;outline:none;transition:all .2s ease;background:#fafbfc}
    .input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(99,102,241,.15);background:#fff}
    .input:focus + .input-icon{color:var(--primary)}
    .actions{margin-top:20px}
    button{width:100%;appearance:none;border:0;border-radius:14px;padding:14px 16px;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--primary),var(--primary2));cursor:pointer;transition:all .2s ease;font-size:1rem;display:flex;align-items:center;justify-content:center;gap:8px}
    button:hover{filter:brightness(.95);transform:translateY(-1px);box-shadow:0 8px 25px rgba(79,70,229,.3)}
    button:active{transform:translateY(0)}
    .note{margin-top:16px;color:var(--muted);font-size:.9rem;text-align:center}
    .footer{margin-top:20px;text-align:center;font-size:.85rem;color:#94a3b8}
    .background-decoration{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle, rgba(79,70,229,.03) 0%, transparent 70%);pointer-events:none;z-index:-1}
  </style>
</head>
<body>
  <div class="background-decoration"></div>
  <div class="card">
    <div class="header">
      <div class="logo">🔒</div>
      <div>
        <h1>Password Required</h1>
      </div>
    </div>
    <p class="lead">This short link is protected with a password. Please enter the correct password to continue.</p>

    ${error ? `<div class="alert">
      <span class="alert-icon">⚠️</span>
      <span>${error}</span>
    </div>` : ""}

    <form method="POST" action="/${shortCode}/verify">
      <div class="form-group">
        <label for="password">Enter Password</label>
        <div class="input-container">
          <input type="password" id="password" name="password" class="input" placeholder="Enter the password to unlock" required />
          <span class="input-icon">🔑</span>
        </div>
      </div>
      <div class="actions">
        <button type="submit">
          <span>Unlock Link</span>
          <span>→</span>
        </button>
      </div>
    </form>

    <div class="note">
      This link requires authentication to access the destination URL.
    </div>
  </div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return res.redirect(record.originalUrl);
    }

    const cacheKey = `url:${shortCode}`;

    // 1) Cache lookup
    let url = await cache.get(cacheKey);

    // 2) DB fallback and cache prime
    if (!url) {
      const doc = await Url.findOne({
        $or: [{ shortCode }, { customCode: shortCode }],
      }).lean();
      if (!doc) {
        return res
          .status(404)
          .json({ success: false, message: "URL not found" });
      }
      url = {
        _id: doc._id,
        originalUrl: doc.originalUrl,
        expiresAt: doc.expiresAt || null,
        isPasswordProtected: doc.isPasswordProtected || false,
      };
      await cache.set(cacheKey, url, 300);
    }

    // 3) Expiration check
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "URL has expired" });
    }

    // 3.5) If password protected, show a lightweight password prompt page
    if (url.isPasswordProtected) {
      const { shortCode } = req.params;
      const error =
        req.query && req.query.error
          ? "Invalid password. Please try again."
          : "";
      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Password Required</title>
  <style>
    :root{--bg1:#eef2ff;--bg2:#e0f2fe;--primary:#4f46e5;--primary2:#6366f1;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--danger:#ef4444;}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 600px at -10% -10%, var(--bg2), transparent), radial-gradient(1200px 600px at 110% 110%, var(--bg1), transparent), #f8fafc;color:var(--text);font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";}
    .card{width:100%;max-width:480px;background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:0 25px 50px -20px rgba(2,6,23,.25);padding:32px;position:relative;overflow:hidden;}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--primary),var(--primary2));}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:12px}
    .logo{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff;font-size:20px;}
    h1{font-size:1.5rem;line-height:1.3;margin:0;font-weight:700}
    p.lead{margin:.5rem 0 1.5rem 0;color:var(--muted);font-size:1.1rem}
    .alert{display:flex;align-items:flex-start;gap:10px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin:0 0 16px 0;font-size:1rem;border-left:4px solid var(--danger)}
    .alert-icon{font-size:18px;margin-top:1px}
    .form-group{margin-bottom:20px}
    label{display:block;font-weight:600;margin:0 0 8px 0;color:var(--text);font-size:1rem}
    .input-container{position:relative}
    .input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:18px}
    .input{width:100%;padding:14px 14px 14px 44px;border:1px solid var(--border);border-radius:14px;font-size:1rem;outline:none;transition:all .2s ease;background:#fafbfc}
    .input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(99,102,241,.15);background:#fff}
    .input:focus + .input-icon{color:var(--primary)}
    .actions{margin-top:20px}
    button{width:100%;appearance:none;border:0;border-radius:14px;padding:14px 16px;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--primary),var(--primary2));cursor:pointer;transition:all .2s ease;font-size:1rem;display:flex;align-items:center;justify-content:center;gap:8px}
    button:hover{filter:brightness(.95);transform:translateY(-1px);box-shadow:0 8px 25px rgba(79,70,229,.3)}
    button:active{transform:translateY(0)}
    .note{margin-top:16px;color:var(--muted);font-size:.9rem;text-align:center}
    .footer{margin-top:20px;text-align:center;font-size:.85rem;color:#94a3b8}
    .background-decoration{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle, rgba(79,70,229,.03) 0%, transparent 70%);pointer-events:none;z-index:-1}
  </style>
</head>
<body>
  <div class="background-decoration"></div>
  <div class="card">
    <div class="header">
      <div class="logo">🔒</div>
      <div>
        <h1>Password Required</h1>
      </div>
    </div>
    <p class="lead">This short link is protected with a password. Please enter the correct password to continue.</p>

    ${error ? `<div class="alert">
      <span class="alert-icon">⚠️</span>
      <span>${error}</span>
    </div>` : ""}

    <form method="POST" action="/${shortCode}/verify">
      <div class="form-group">
        <label for="password">Enter Password</label>
        <div class="input-container">
          <input type="password" id="password" name="password" class="input" placeholder="Enter the password to unlock" required />
          <span class="input-icon">🔑</span>
        </div>
      </div>
      <div class="actions">
        <button type="submit">
          <span>Unlock Link</span>
          <span>→</span>
        </button>
      </div>
    </form>

    <div class="note">
      This link requires authentication to access the destination URL.
    </div>
  </div>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    // 4) Fire-and-forget analytics + counters
    Url.updateOne(
      { _id: url._id },
      {
        $inc: { clickCount: 1 },
        $set: { lastAccessed: new Date() },
        $push: {
          analytics: {
            timestamp: new Date(),
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            referrer: req.get("Referer") || "Direct",
          },
        },
      }
    ).catch(() => {});

    // Extract user ID from JWT token if present
    let userId = null;
    const authHeader = req.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, continue without user ID
      }
    }

    // Also store raw event for future aggregation
    ClickEvent.create({
      urlId: url._id,
      userId: userId,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referer") || "Direct",
    }).catch(() => {});

    // 5) Redirect fast with proper CORS headers for external URLs
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error in redirect:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GET /api/urls/:shortCode - Get URL info (for preview)
router.get("/api/urls/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customCode: shortCode }],
    }).select(
      "originalUrl shortCode customCode clickCount createdAt expiresAt"
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Check if expired
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: "URL has expired",
      });
    }

    res.json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode || url.customCode,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error in URL info:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// POST /:shortCode/verify - Verify password and redirect
// Add small rate limit to reduce brute force
const createRateLimiter = require("../middleware/rateLimiter");
const shortCodeVerifyLimiter = createRateLimiter(15 * 60 * 1000, 20);
router.post("/:shortCode/verify", shortCodeVerifyLimiter, async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body || {};

    const mongoose = require("mongoose");
    if (OFFLINE_MODE && mongoose.connection.readyState !== 1) {
      const rec = OFFLINE_URLS.get(shortCode);
      if (!rec)
        return res
          .status(404)
          .json({ success: false, message: "URL not found" });
      if (rec.expiresAt && rec.expiresAt < new Date()) {
        return res
          .status(410)
          .json({ success: false, message: "URL has expired" });
      }
      if (!rec.isPasswordProtected || !rec.passwordHash) {
        return res.redirect(rec.originalUrl);
      }
      const ok = await bcrypt.compare(password || "", rec.passwordHash);
      if (!ok) return res.redirect(`/${shortCode}?error=1`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return res.redirect(rec.originalUrl);
    }

    const doc = await Url.findOne({
      $or: [{ shortCode }, { customCode: shortCode }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }

    // Expired
    if (doc.expiresAt && doc.expiresAt < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "URL has expired" });
    }

    // If no password is set, redirect directly
    if (!doc.isPasswordProtected || !doc.password) {
      return res.redirect(doc.originalUrl);
    }

    const isMatch = await bcrypt.compare(password || "", doc.password);
    if (!isMatch) {
      return res.redirect(`/${shortCode}?error=1`);
    }

    // Set CORS headers for external URL redirect
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.redirect(doc.originalUrl);
  } catch (error) {
    console.error("Error verifying password:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/urls/:shortCode/password - Add/Change/Remove password
// Note: Requires ownership for URLs created by authenticated users.
router.put("/api/urls/:shortCode/password", optionalAuth, async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body || {};

    const url = await Url.findOne({
      $or: [{ shortCode }, { customCode: shortCode }],
    });
    if (!url) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }

    // Ownership checks similar to delete
    if (req.user) {
      if (url.userId && !url.userId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own URLs",
        });
      }
    } else {
      if (url.userId !== null) {
        return res
          .status(403)
          .json({ success: false, message: "Authentication required" });
      }
    }

    let nextProtected = false;
    let nextHash = null;

    if (typeof password === "string" && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      nextHash = await bcrypt.hash(password.trim(), salt);
      nextProtected = true;
    }

    url.isPasswordProtected = nextProtected;
    url.password = nextHash;
    await url.save();

    // Invalidate redirect cache for both code variants
    try {
      await cache.del(`url:${url.shortCode}`);
      if (url.customCode) await cache.del(`url:${url.customCode}`);
    } catch (_) {}

    return res.json({ success: true, isPasswordProtected: nextProtected });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/urls/:shortCode - Delete a URL by short code or custom code
router.delete("/api/urls/:shortCode", optionalAuth, async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customCode: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Check ownership for authenticated users
    if (req.user) {
      if (url.userId && !url.userId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own URLs",
        });
      }
    } else {
      // Anonymous users can only delete anonymous URLs
      if (url.userId !== null) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete this URL",
        });
      }
    }

    await Url.deleteOne({ _id: url._id });

    return res.json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
