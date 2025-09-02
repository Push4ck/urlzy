const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for anonymous users
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    analytics: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ip: String,
        userAgent: String,
        referrer: String,
        country: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Url", urlSchema);
