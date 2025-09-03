const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
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

// GET /api/urls/list - List URLs (filtered by user if authenticated)
router.get("/api/urls/list", optionalAuth, async (req, res) => {
  try {
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
      const { originalUrl, customCode } = req.body;

      // Validate original URL
      if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });
      }

      // Check if URL already exists (for the same user or anonymous)
      const userId = req.user ? req.user._id : null;
      const existingUrl = await Url.findOne({
        originalUrl,
        userId,
        expiresAt: { $gt: new Date() }, // Not expired
      });

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

      // Handle custom code
      if (customCode) {
        const isAvailable = await isCustomCodeAvailable(customCode);
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: "Custom code is not available or invalid",
          });
        }
        shortCode = customCode;
      } else {
        shortCode = await generateUniqueCode();
      }

      // Set expiration based on user type
      let expiresAt = null;
      if (!req.user) {
        // Anonymous users: 30 days expiration
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      // Authenticated users: no expiration (null)

      // Create URL document
      const url = new Url({
        originalUrl,
        shortCode,
        customCode: customCode || null,
        userId: userId,
        expiresAt,
      });

      await url.save();

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
      };
      await cache.set(cacheKey, url, 300);
    }

    // 3) Expiration check
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res
        .status(410)
        .json({ success: false, message: "URL has expired" });
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

    // 5) Redirect fast
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
