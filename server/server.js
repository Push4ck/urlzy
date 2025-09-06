const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
// const morgan = require("morgan"); // Temporarily disabled - install with: npm install morgan
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();

// Initialize email transport early (surfacing production misconfiguration immediately)
const { initEmail } = require("./utils/email");
(async () => {
  try {
    const ok = await initEmail();
    if (ok) {
      logger.info("Email service initialized successfully");
    } else if (process.env.NODE_ENV !== "production") {
      logger.warn("Email service not fully configured - using dev console fallback");
    }
  } catch (e) {
    logger.error("Email service initialization failed", { error: e?.message || e });
    if (process.env.NODE_ENV === "production") {
      // In production, continue starting the server but email endpoints may fail explicitly
      // Alternatively, uncomment the next line to fail-fast in production
      // process.exit(1);
    }
  }
})();

// Middleware
// CORS: allow one or more client origins via env CLIENT_URLS (comma-separated) or CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

// Add known production origins as fallback ONLY in development
const productionOrigins =
  process.env.NODE_ENV === "development"
    ? [
        "https://urlzy.netlify.app",
        "http://localhost:3000",
        "http://localhost:5173", // Vite dev server
      ]
    : [];

// Merge allowed origins with production fallbacks
const allAllowedOrigins = [
  ...new Set([...allowedOrigins, ...productionOrigins]),
];

// Add debug logging for CORS in development
if (process.env.NODE_ENV !== "production") {
  logger.debug("CORS configuration", {
    allowedOrigins: allAllowedOrigins,
    clientUrl: process.env.CLIENT_URL
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    logger.debug("CORS request", { origin });

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allAllowedOrigins.includes(origin)) {
      logger.debug("CORS origin allowed", { origin });
      return callback(null, true);
    }

    // Allow localhost only in development
    if (
      process.env.NODE_ENV !== "production" &&
      origin &&
      (origin.includes("localhost") || origin.includes("127.0.0.1"))
    ) {
      logger.debug("CORS origin allowed (localhost dev)", { origin });
      return callback(null, true);
    }

    logger.warn("CORS origin blocked", { origin });
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Access-Control-Allow-Origin"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
};

// Separate CORS options for redirects that allow all origins
const redirectCorsOptions = {
  origin: true, // Allow all origins for redirects
  credentials: false, // Don't send credentials for external redirects
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Hide framework header
app.disable("x-powered-by");

// Apply strict CORS only to API routes
app.use("/api", cors(corsOptions));
app.options("/api/*", cors(corsOptions));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? undefined // enable default CSP in prod unless ENABLE_CSP=false
        : process.env.ENABLE_CSP === "true"
        ? undefined
        : false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts:
      process.env.NODE_ENV === "production" ? { maxAge: 15552000 } : undefined, // 180 days in prod
  })
);
app.use(mongoSanitize());
app.use(compression());

// HTTP request logging
// app.use(morgan('combined', { stream: logger.stream })); // Temporarily disabled

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
  })
  .then(() => {
    logger.info("MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    const start = (port) => {
      const server = app.listen(port, () => {
        logger.info("Server started", {
          port,
          environment: process.env.NODE_ENV || "development",
          apiUrl: `http://localhost:${port}`
        });
      });
      server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
          logger.warn(`Port ${port} in use, trying ${Number(port) + 1}`, { error: err.message });
          setTimeout(() => start(Number(port) + 1), 500);
        } else {
          logger.error("Server failed to start", { error: err.message });
          throw err;
        }
      });
    };
    start(PORT);
  })
  .catch((err) => {
    logger.error("MongoDB connection error", { error: err.message });

    // In production: fail fast
    if (process.env.NODE_ENV === "production") {
      logger.error("Exiting due to database connection failure in production");
      process.exit(1);
    }

    logger.info("Starting server in offline mode (limited functionality)");
    logger.info("To fix database connection:");
    logger.info("1. Go to https://cloud.mongodb.com");
    logger.info("2. Navigate to Network Access");
    logger.info("3. Add your IP address (or use 0.0.0.0/0 for testing)");
    logger.info("4. Wait 1-3 minutes for changes to apply");

    // Start server even without DB for development only
    const PORT = process.env.PORT || 5000;
    const start = (port) => {
      const server = app.listen(port, () => {
        logger.warn("Server running in offline mode", {
          port,
          environment: process.env.NODE_ENV || "development",
          apiUrl: `http://localhost:${port}`,
          note: "Database not connected - some features may not work"
        });
      });
      server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
          logger.warn(`Port ${port} in use, trying ${Number(port) + 1}`, { error: err.message });
          setTimeout(() => start(Number(port) + 1), 500);
        } else {
          logger.error("Server failed to start", { error: err.message });
          throw err;
        }
      });
    };
    start(PORT);
  });

// Routes
const urlRoutes = require("./routes/urls");
const authRoutes = require("./routes/auth");
const billingRoutes = require("./routes/billing");
const path = require("path");

// Apply permissive CORS to redirect routes to handle external URL redirects
app.use("/:shortCode", cors(redirectCorsOptions)); // For GET /:shortCode redirects
app.use("/:shortCode/verify", cors(redirectCorsOptions)); // For POST /:shortCode/verify redirects
// Ensure preflight is handled for redirect routes
app.options("/:shortCode", cors(redirectCorsOptions));
app.options("/:shortCode/verify", cors(redirectCorsOptions));

// Detailed health check with metrics
app.get("/health/detailed", async (req, res) => {
  const detailedHealth = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.version,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
    },
    cpu: process.cpuUsage(),
    checks: {}
  };

  try {
    // Database connectivity and stats
    if (mongoose.connection.readyState === 1) {
      const dbStats = await mongoose.connection.db.stats();
      detailedHealth.checks.database = {
        status: "healthy",
        message: "MongoDB connected",
        stats: {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: `${Math.round(dbStats.dataSize / 1024 / 1024)} MB`,
          storageSize: `${Math.round(dbStats.storageSize / 1024 / 1024)} MB`
        }
      };
    } else {
      detailedHealth.checks.database = {
        status: "unhealthy",
        message: `MongoDB connection state: ${mongoose.connection.readyState}`
      };
      detailedHealth.success = false;
    }

    // Email service check
    const { isEmailConfigured } = require("./utils/email");
    detailedHealth.checks.email = {
      status: isEmailConfigured() ? "healthy" : "degraded",
      message: isEmailConfigured() ? "Email service configured" : "Email service not configured"
    };

    // User count check
    try {
      const User = require("./models/User");
      const userCount = await User.countDocuments();
      detailedHealth.checks.users = {
        status: "healthy",
        message: "User collection accessible",
        count: userCount
      };
    } catch (error) {
      detailedHealth.checks.users = {
        status: "unhealthy",
        message: "Cannot access user collection",
        error: error.message
      };
      detailedHealth.success = false;
    }

    // URL count check
    try {
      const Url = require("./models/Url");
      const urlCount = await Url.countDocuments();
      detailedHealth.checks.urls = {
        status: "healthy",
        message: "URL collection accessible",
        count: urlCount
      };
    } catch (error) {
      detailedHealth.checks.urls = {
        status: "unhealthy",
        message: "Cannot access URL collection",
        error: error.message
      };
      detailedHealth.success = false;
    }

    logger.info("Detailed health check performed", {
      success: detailedHealth.success,
      databaseStatus: detailedHealth.checks.database?.status,
      userCount: detailedHealth.checks.users?.count,
      urlCount: detailedHealth.checks.urls?.count
    });

    res.status(detailedHealth.success ? 200 : 503).json(detailedHealth);
  } catch (error) {
    logger.error("Detailed health check failed", { error: error.message });
    res.status(503).json({
      success: false,
      message: "Detailed health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic health check
app.get("/health", async (req, res) => {
  const healthCheck = {
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.version,
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    // Database connectivity check
    if (mongoose.connection.readyState === 1) {
      healthCheck.checks.database = {
        status: "healthy",
        message: "MongoDB connected"
      };
    } else {
      healthCheck.checks.database = {
        status: "unhealthy",
        message: `MongoDB connection state: ${mongoose.connection.readyState}`
      };
      healthCheck.success = false;
    }

    // Email service check
    const { isEmailConfigured } = require("./utils/email");
    healthCheck.checks.email = {
      status: isEmailConfigured() ? "healthy" : "degraded",
      message: isEmailConfigured() ? "Email service configured" : "Email service not configured"
    };

    // Response time check
    const start = Date.now();
    setImmediate(() => {
      healthCheck.responseTime = Date.now() - start;
    });

    logger.info("Health check performed", {
      success: healthCheck.success,
      databaseStatus: healthCheck.checks.database.status,
      emailStatus: healthCheck.checks.email.status
    });

    res.status(healthCheck.success ? 200 : 503).json(healthCheck);
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(503).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use("/", urlRoutes); // This handles both API routes (/api/urls/*) and redirect routes (/:shortCode)
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);

// Serve static files from React app build directory
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
} else {
  // In development, serve from client directory (Vite dev server handles this)
  app.use(express.static(path.join(__dirname, "../client")));
}

// Catch-all handler: serve React app for client-side routing
app.get("*", (req, res) => {
  // Only serve React app for non-API routes
  if (!req.path.startsWith("/api")) {
    if (process.env.NODE_ENV === "production") {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    } else {
      res.sendFile(path.join(__dirname, "../client/index.html"));
    }
  } else {
    // For API routes that don't exist, return 404 JSON
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// app.listen is started only after successful Mongo connection above
