const express = require("express");
const router = express.Router();
const Url = require("../models/Url");
const {
  generateUniqueCode,
  isCustomCodeAvailable,
  isValidUrl,
} = require("../utils/shortCode");

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const limit = 5; // 5 URLs per day for anonymous users

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const userLimit = rateLimitMap.get(ip);

  if (now > userLimit.resetTime) {
    // Reset the limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userLimit.count >= limit) {
    return res.status(429).json({
      success: false,
      message:
        "Rate limit exceeded. Maximum 5 URLs per day for anonymous users.",
    });
  }

  userLimit.count++;
  next();
};

// POST /api/shorten - Create short URL
router.post("/shorten", rateLimit, async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    // Validate original URL
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    // Check if URL already exists (for anonymous users)
    const existingUrl = await Url.findOne({
      originalUrl,
      userId: null,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (existingUrl) {
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      const shortUrl = `${baseUrl}/${existingUrl.shortCode}`;

      return res.json({
        success: true,
        data: {
          originalUrl: existingUrl.originalUrl,
          shortUrl,
          shortCode: existingUrl.shortCode,
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

    // Set expiration for anonymous users (30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create URL document
    const url = new Url({
      originalUrl,
      shortCode,
      customCode: customCode || null,
      userId: null, // Anonymous user
      expiresAt,
    });

    await url.save();

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const shortUrl = `${baseUrl}/${shortCode}`;

    res.status(201).json({
      success: true,
      data: {
        originalUrl,
        shortUrl,
        shortCode,
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
});

// GET /:shortCode - Redirect to original URL
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by shortCode or customCode
    const url = await Url.findOne({
      $or: [{ shortCode }, { customCode: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Check if URL is expired
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: "URL has expired",
      });
    }

    // Update analytics
    url.clickCount += 1;
    url.lastAccessed = new Date();

    // Basic analytics (can be enhanced later)
    const analyticsData = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referer") || "Direct",
    };

    url.analytics.push(analyticsData);

    await url.save();

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error in redirect:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// GET /api/url/:shortCode - Get URL info (for preview)
router.get("/api/url/:shortCode", async (req, res) => {
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

module.exports = router;
