const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
// CORS: allow one or more client origins via env CLIENT_URLS (comma-separated) or CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

// Add known production origins as fallback
const productionOrigins = [
  "https://urlzy.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
];

// Merge allowed origins with production fallbacks
const allAllowedOrigins = [
  ...new Set([...allowedOrigins, ...productionOrigins]),
];

// Add debug logging for CORS
console.log("Allowed CORS origins:", allAllowedOrigins);
console.log("CLIENT_URL from env:", process.env.CLIENT_URL);

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

    // Temporary fix: Allow all netlify.app subdomains
    if (origin && origin.includes(".netlify.app")) {
      console.log("Origin allowed (netlify.app):", origin);
      return callback(null, true);
    }

    // Allow localhost for development
    if (
      origin &&
      (origin.includes("localhost") || origin.includes("127.0.0.1"))
    ) {
      console.log("Origin allowed (localhost):", origin);
      return callback(null, true);
    }

    console.log("Origin blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Fail fast in production to avoid serving while DB is unavailable
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

// Routes
const urlRoutes = require("./routes/urls");
const authRoutes = require("./routes/auth");
const billingRoutes = require("./routes/billing");

// API routes
app.use("/", urlRoutes); // This handles both API routes (/api/urls/*) and redirect routes (/:shortCode)
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
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
