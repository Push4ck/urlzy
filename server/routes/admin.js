const express = require("express");
const mongoose = require("mongoose");
const { authenticate, requireAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Url = require("../models/Url");
const ClickEvent = require("../models/ClickEvent");
const Settings = require("../models/Settings");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication and admin middleware to all admin routes
router.use(authenticate);
router.use(requireAdmin);

// System status endpoint
router.get("/system-status", async (req, res) => {
  try {
    const systemStatus = {
      database: { status: "unknown", message: "Checking..." },
      apiServer: { status: "unknown", message: "Checking..." },
      cache: { status: "unknown", message: "Checking..." },
    };

    // Check database status
    if (mongoose.connection.readyState === 1) {
      systemStatus.database = {
        status: "online",
        message: "Connected",
      };
    } else {
      systemStatus.database = {
        status: "offline",
        message: `Connection state: ${mongoose.connection.readyState}`,
      };
    }

    // API Server status (always running if this code executes)
    systemStatus.apiServer = {
      status: "running",
      message: "Operational",
    };

    // Cache status (simplified - could be enhanced with Redis check)
    systemStatus.cache = {
      status: "active",
      message: "In-memory cache active",
    };

    logger.info("System status check performed", {
      database: systemStatus.database.status,
      apiServer: systemStatus.apiServer.status,
      cache: systemStatus.cache.status,
    });

    res.json({
      success: true,
      data: systemStatus,
    });
  } catch (error) {
    logger.error("System status check failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to check system status",
      error: error.message,
    });
  }
});

// Recent activity endpoint
router.get("/activity", async (req, res) => {
  try {
    const activities = [];

    // Get recent user registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } })
      .select("username email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    recentUsers.forEach((user) => {
      activities.push({
        action: `New user registered: ${user.username}`,
        user: user.username,
        timestamp: user.createdAt,
        type: "user_registration",
      });
    });

    // Get recent URL creations (last 7 days)
    const recentUrls = await Url.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate("userId", "username")
      .select("shortCode originalUrl createdAt userId")
      .sort({ createdAt: -1 })
      .limit(5);

    recentUrls.forEach((url) => {
      activities.push({
        action: `URL shortened: ${url.shortCode}`,
        user: url.userId?.username || "Anonymous",
        timestamp: url.createdAt,
        type: "url_creation",
      });
    });

    // Get recent click events (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClicks = await ClickEvent.find({ ts: { $gte: oneDayAgo } })
      .populate("urlId", "shortCode originalUrl")
      .populate("userId", "username")
      .select("urlId userId ts ip userAgent referrer")
      .sort({ ts: -1 })
      .limit(5);

    recentClicks.forEach((click) => {
      activities.push({
        action: `URL clicked: ${click.urlId?.shortCode || "Unknown"}`,
        user: click.userId?.username || "Anonymous",
        timestamp: click.ts,
        type: "url_click",
        details: {
          originalUrl: click.urlId?.originalUrl || "N/A",
          ip: click.ip || "N/A",
          userAgent: click.userAgent || "N/A",
          referrer: click.referrer || "Direct"
        }
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Take only the most recent 10 activities
    const recentActivities = activities.slice(0, 10);

    logger.info("Recent activity fetched", { count: recentActivities.length });

    res.json({
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    logger.error("Recent activity fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
});

// System metrics endpoint
router.get("/system-metrics", async (req, res) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
        total: Math.round(require('os').totalmem() / 1024 / 1024), // MB
        percentage: Math.round((process.memoryUsage().rss / require('os').totalmem()) * 100)
      },
      cpu: {
        usage: Math.round(Math.random() * 30 + 10), // Mock CPU usage (would need system monitoring library for real data)
        cores: require('os').cpus().length
      },
      responseTime: Math.round(Math.random() * 50 + 20), // Mock response time (would need monitoring for real data)
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      network: {
        hostname: require('os').hostname(),
        networkInterfaces: Object.keys(require('os').networkInterfaces()).length
      }
    };

    logger.info("System metrics fetched", {
      uptime: metrics.uptime,
      memoryUsage: metrics.memory.percentage,
      cpuCores: metrics.cpu.cores
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error("System metrics fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch system metrics",
      error: error.message
    });
  }
});

// Link management endpoints
router.get("/links", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { shortCode: { $regex: search, $options: "i" } },
            { originalUrl: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await Url.countDocuments(searchQuery);

    // Get URLs with pagination and sorting
    const urls = await Url.find(searchQuery)
      .populate("userId", "username email")
      .select("shortCode originalUrl clickCount createdAt updatedAt userId password expiresAt")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get click statistics for each URL
    const urlsWithStats = await Promise.all(
      urls.map(async (url) => {
        const clickStats = await ClickEvent.aggregate([
          { $match: { urlId: url._id } },
          {
            $group: {
              _id: null,
              totalClicks: { $sum: 1 },
              uniqueIPs: { $addToSet: "$ip" },
              recentClicks: {
                $push: {
                  timestamp: "$ts",
                  ip: "$ip",
                  userAgent: "$userAgent",
                },
              },
            },
          },
        ]);

        const stats = clickStats[0] || {
          totalClicks: 0,
          uniqueIPs: [],
          recentClicks: [],
        };

        return {
          ...url,
          stats: {
            totalClicks: stats.totalClicks,
            uniqueVisitors: stats.uniqueIPs.length,
            recentClicks: stats.recentClicks.slice(-5), // Last 5 clicks
          },
        };
      })
    );

    logger.info("Links fetched", {
      page,
      limit,
      search,
      total,
      count: urlsWithStats.length
    });

    res.json({
      success: true,
      data: urlsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Links fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch links",
      error: error.message,
    });
  }
});

// Update URL
router.put("/links/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, password, expiresAt } = req.body;

    const updateData = {};
    if (originalUrl) updateData.originalUrl = originalUrl;
    if (password !== undefined) updateData.password = password;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;

    const url = await Url.findOneAndUpdate(
      { shortCode },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate("userId", "username email");

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    logger.info("URL updated", { shortCode, updates: Object.keys(updateData) });

    res.json({
      success: true,
      data: url,
      message: "URL updated successfully",
    });
  } catch (error) {
    logger.error("URL update failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to update URL",
      error: error.message,
    });
  }
});

// Delete URL
router.delete("/links/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find and delete the URL
    const url = await Url.findOneAndDelete({ shortCode });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Delete associated click events
    await ClickEvent.deleteMany({ urlId: url._id });

    logger.info("URL deleted", { shortCode, clickEventsDeleted: true });

    res.json({
      success: true,
      message: "URL and associated data deleted successfully",
    });
  } catch (error) {
    logger.error("URL deletion failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to delete URL",
      error: error.message,
    });
  }
});

// Get URL statistics
router.get("/links/:shortCode/stats", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Get detailed click statistics
    const clickStats = await ClickEvent.aggregate([
      { $match: { urlId: url._id } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$ts",
              },
            },
          },
          clicks: { $sum: 1 },
          uniqueIPs: { $addToSet: "$ip" },
        },
      },
      {
        $project: {
          date: "$_id.date",
          clicks: 1,
          uniqueVisitors: { $size: "$uniqueIPs" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Get top referrers
    const topReferrers = await ClickEvent.aggregate([
      { $match: { urlId: url._id, referrer: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent clicks
    const recentClicks = await ClickEvent.find({ urlId: url._id })
      .sort({ ts: -1 })
      .limit(20)
      .select("ts ip userAgent referrer");

    logger.info("URL stats fetched", { shortCode, clickStatsCount: clickStats.length });

    res.json({
      success: true,
      data: {
        url: {
          shortCode: url.shortCode,
          originalUrl: url.originalUrl,
          clickCount: url.clickCount,
          createdAt: url.createdAt,
        },
        statistics: {
          dailyClicks: clickStats,
          topReferrers,
          recentClicks,
          totalClicks: url.clickCount,
          uniqueVisitors: clickStats.reduce((sum, day) => sum + day.uniqueVisitors, 0),
        },
      },
    });
  } catch (error) {
    logger.error("URL stats fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch URL statistics",
      error: error.message,
    });
  }
});

// System maintenance endpoints
router.post("/maintenance/cleanup", async (req, res) => {
  try {
    const { type, days } = req.body;

    let deletedCount = 0;

    if (type === "expired") {
      // Delete expired URLs
      const expiredUrls = await Url.find({
        expiresAt: { $lt: new Date() },
        expiresAt: { $ne: null }
      });

      for (const url of expiredUrls) {
        await ClickEvent.deleteMany({ urlId: url._id });
      }

      const result = await Url.deleteMany({
        expiresAt: { $lt: new Date() },
        expiresAt: { $ne: null }
      });

      deletedCount = result.deletedCount;
    } else if (type === "old_clicks" && days) {
      // Delete old click events
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await ClickEvent.deleteMany({
        ts: { $lt: cutoffDate }
      });
      deletedCount = result.deletedCount;
    }

    logger.info("System cleanup performed", { type, deletedCount, days });

    res.json({
      success: true,
      message: `Cleanup completed. ${deletedCount} items removed.`,
      data: { deletedCount }
    });
  } catch (error) {
    logger.error("System cleanup failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to perform system cleanup",
      error: error.message
    });
  }
});

// System information endpoint
router.get("/system-info", async (req, res) => {
  try {
    const systemInfo = {
      server: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().rss / 1024 / 1024),
          total: Math.round(require('os').totalmem() / 1024 / 1024),
          percentage: Math.round((process.memoryUsage().rss / require('os').totalmem()) * 100)
        },
        cpu: {
          cores: require('os').cpus().length,
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name || 'urlzy',
        host: mongoose.connection.host || 'localhost'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Get database stats
    if (mongoose.connection.readyState === 1) {
      try {
        const dbStats = await mongoose.connection.db.stats();
        systemInfo.database.stats = {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: `${Math.round(dbStats.dataSize / 1024 / 1024)} MB`,
          storageSize: `${Math.round(dbStats.storageSize / 1024 / 1024)} MB`
        };
      } catch (dbError) {
        systemInfo.database.stats = { error: 'Unable to fetch stats' };
      }
    }

    logger.info("System information retrieved");

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    logger.error("System info fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch system information",
      error: error.message
    });
  }
});

// Advanced settings endpoints
router.get("/advanced-settings", async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      data: {
        rateLimitWindow: settings.rateLimitWindow,
        rateLimitMax: settings.rateLimitMax,
        maxUrlLength: settings.maxUrlLength,
        defaultExpiryDays: settings.defaultExpiryDays,
        enableClickTracking: settings.enableClickTracking,
        enableUserAnalytics: settings.enableUserAnalytics,
        backupFrequency: settings.backupFrequency,
        logRetentionDays: settings.logRetentionDays,
        enableMaintenanceMode: settings.enableMaintenanceMode,
        maintenanceMessage: settings.maintenanceMessage
      }
    });
  } catch (error) {
    logger.error("Advanced settings fetch failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch advanced settings",
      error: error.message
    });
  }
});

router.put("/advanced-settings", async (req, res) => {
  try {
    const updates = req.body;

    // Save to database using the Settings model
    await Settings.updateSettings(updates);

    logger.info("Advanced settings updated", { updates: Object.keys(updates) });

    res.json({
      success: true,
      message: "Advanced settings updated successfully",
      data: updates
    });
  } catch (error) {
    logger.error("Advanced settings update failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to update advanced settings",
      error: error.message
    });
  }
});

module.exports = router;
