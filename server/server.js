const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
require("dotenv").config();

const app = express();

// Initialize email transport early (surfacing production misconfiguration immediately)
const { initEmail } = require("./utils/email");
(async () => {
  try {
    const ok = await initEmail();
    if (ok) {
      console.log("📧 Email service initialized successfully");
    } else if (process.env.NODE_ENV !== "production") {
      console.log(
        "📧 Email service not fully configured - using dev console fallback"
      );
    }
  } catch (e) {
    console.error("❌ Email service initialization failed:", e?.message || e);
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
  console.log("Allowed CORS origins:", allAllowedOrigins);
  console.log("CLIENT_URL from env:", process.env.CLIENT_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS request from origin:", origin);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allAllowedOrigins.includes(origin)) {
      console.log("Origin allowed:", origin);
      return callback(null, true);
    }

    // Allow localhost only in development
    if (
      process.env.NODE_ENV !== "production" &&
      origin &&
      (origin.includes("localhost") || origin.includes("127.0.0.1"))
    ) {
      console.log("Origin allowed (localhost dev):", origin);
      return callback(null, true);
    }

    console.log("Origin blocked:", origin);
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
    console.log("✅ MongoDB connected successfully!");
    const PORT = process.env.PORT || 5000;
    const start = (port) => {
      const server = app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 API available at: http://localhost:${port}`);
      });
      server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
          const next = Number(port) + 1;
          console.warn(`⚠️  Port ${port} in use. Trying ${next}...`);
          setTimeout(() => start(next), 500);
        } else {
          throw err;
        }
      });
    };
    start(PORT);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);

    // In production: fail fast
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }

    console.log("\n🔧 To fix this:");
    console.log("1. Go to https://cloud.mongodb.com");
    console.log("2. Navigate to Network Access");
    console.log("3. Add your IP address (or use 0.0.0.0/0 for testing)");
    console.log("4. Wait 1-3 minutes for changes to apply");
    console.log(
      "\n⚠️  Starting server in offline mode (limited functionality)\n"
    );

    // Start server even without DB for development only
    const PORT = process.env.PORT || 5000;
    const start = (port) => {
      const server = app.listen(port, () => {
        console.log(`🚀 Server running on port ${port} (offline mode)`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔗 API available at: http://localhost:${port}`);
        console.log(`⚠️  Database not connected - some features may not work`);
      });
      server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE") {
          const next = Number(port) + 1;
          console.warn(`⚠️  Port ${port} in use. Trying ${next}...`);
          setTimeout(() => start(next), 500);
        } else {
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

// Health check (define BEFORE catch-all shortCode route to avoid interception)
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
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
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// app.listen is started only after successful Mongo connection above
