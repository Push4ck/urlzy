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
      const cleanCustomCode = (customCode && typeof customCode === 'string' && customCode.trim()) ? customCode.trim() : null;
      const cleanPassword = (password && typeof password === 'string' && password.trim()) ? password.trim() : null;

      console.log('[DEBUG] Received request:', {
        originalUrl,
        customCode: cleanCustomCode ? 'present' : 'empty',
        password: cleanPassword ? 'present' : 'empty'
      });

      // Validate original URL
      if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });
      }

      // Gate custom codes for authenticated users only
      if (!req.user && customCode) {
        return res.status(403).json({
          success: false,
          message: "Custom short codes require an account. Please log in.",
        });
      }


      // TEMPORARY: Mock response when database is not connected
      const mongoose = require("mongoose");
      if (OFFLINE_MODE && mongoose.connection.readyState !== 1) {
        console.log(
          "🗄️  Database not connected - using offline in-memory store"
        );

        // Generate a simple short code for testing
        const shortCode =
          customCode || `test${Date.now().toString().slice(-6)}`;
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
      // IMPORTANT: Only reuse an existing URL when no customCode is provided.
      const userId = req.user ? req.user._id : null;
      let existingUrl = null;
      if (!customCode) {
        existingUrl = await Url.findOne({
          originalUrl,
          userId,
          expiresAt: { $gt: new Date() }, // Not expired
        });
      }

      if (existingUrl) {
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const shortUrl = `${baseUrl}/${
          existingUrl.customCode || existingUrl.shortCode
        }`;

        return res.json({
          success: true,
          data: {
            originalUrl: existingUrl.originalUrl,
            shortUrl,
            shortCode: existingUrl.customCode || existingUrl.shortCode,
            createdAt: existingUrl.createdAt,
          },
        });
      }

      let shortCode;

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
      } else {
        shortCode = await generateUniqueCode();
      }

      // Set expiration based on user type
      let expiresAt = null;
      if (!req.user) {
        // Anonymous users: 7 days expiration
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else if (req.user.role === 'admin') {
        // Admin users: custom expiration or no expiration
        if (req.body.expiresAt) {
          expiresAt = new Date(req.body.expiresAt);
          // Validate expiry is within 1 hour to 30 days
          const minExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
          const maxExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          if (expiresAt < minExpiry || expiresAt > maxExpiry) {
            return res.status(400).json({
              success: false,
              message: "Expiry must be between 1 hour and 30 days from now",
            });
          }
        }
        // If no custom expiry provided, admin gets no expiration (null)
      }
      // Regular authenticated users: no expiration (null)

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

      // Only set customCode if it exists and is not empty
      if (customCode && customCode.trim()) {
        urlData.customCode = customCode.trim();
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
      const shortUrl = `${baseUrl}/${customCode || shortCode}`;

      res.status(201).json({
        success: true,
        data: {
          originalUrl,
          shortUrl,
          shortCode: customCode || shortCode,
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
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem;background:#f9fafb;color:#111827}.card{max-width:420px;margin:10vh auto;background:#fff;border:1px solid #e5e7eb;border-radius:.75rem;padding:1.5rem;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05)}h1{font-size:1.25rem;margin:0 0 .75rem 0}.error{color:#b91c1c;margin-bottom:.5rem}input[type=password]{width:100%;padding:.625rem .75rem;border:1px solid #d1d5db;border-radius:.5rem}button{margin-top:.75rem;width:100%;background:#4f46e5;color:#fff;border:0;padding:.625rem .75rem;border-radius:.5rem;cursor:pointer}button:hover{background:#4338ca}.muted{color:#6b7280;margin-top:.75rem;font-size:.875rem}</style>
</head>
<body>
  <div class="card">
    <h1>Password Required</h1>
    ${error ? `<div class="error">${error}</div>` : ""}
    <p>This short link is protected. Enter the password to continue.</p>

    <form method="POST" action="/${shortCode}/verify">
      <input type="password" name="password" placeholder="Enter password" required />
      <button type="submit">Unlock & Redirect</button>
    </form>
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
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; background: #f9fafb; color: #111827; }
    .card { max-width: 420px; margin: 10vh auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
    h1 { font-size: 1.25rem; margin: 0 0 0.75rem 0; }
    p { margin: 0.25rem 0 1rem 0; color: #4b5563; }
    .error { color: #b91c1c; margin-bottom: 0.5rem; }
    input[type=password] { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
    button { margin-top: 0.75rem; width: 100%; background: #4f46e5; color: #fff; border: 0; padding: 0.625rem 0.75rem; border-radius: 0.5rem; cursor: pointer; }
    button:hover { background: #4338ca; }
    .muted { color: #6b7280; margin-top: 0.75rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Password Required</h1>
    ${error ? `<div class="error">${error}</div>` : ""}
    <p>This short link is protected. Enter the password to continue.</p>

    <form method="POST" action="/${shortCode}/verify">
      <input type="password" name="password" placeholder="Enter password" required />
      <button type="submit">Unlock & Redirect</button>
    </form>
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

    // Also store raw event for future aggregation
    ClickEvent.create({
      urlId: url._id,
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
