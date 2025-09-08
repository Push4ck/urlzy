const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    userAgent: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
      default: null, // Store refresh token or session identifier
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
deviceSchema.index({ userId: 1, deviceId: 1 });
deviceSchema.index({ userId: 1, lastActive: -1 });
deviceSchema.index({ token: 1 });

// Method to generate device ID from user agent and IP
deviceSchema.statics.generateDeviceId = function (userAgent, ip) {
  const crypto = require("crypto");
  return crypto
    .createHash("md5")
    .update(`${userAgent}-${ip}`)
    .digest("hex");
};

// Method to detect device type from user agent
deviceSchema.statics.detectDeviceType = function (userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  } else {
    return "desktop";
  }
};

// Method to get device name from user agent
deviceSchema.statics.getDeviceName = function (userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("chrome")) return "Chrome Browser";
  if (ua.includes("firefox")) return "Firefox Browser";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari Browser";
  if (ua.includes("edge")) return "Edge Browser";
  if (ua.includes("opera")) return "Opera Browser";
  if (ua.includes("mobile") || ua.includes("android")) return "Mobile Browser";
  if (ua.includes("iphone")) return "Safari on iPhone";
  if (ua.includes("ipad")) return "Safari on iPad";

  // Extract browser name from user agent
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i);
  return browserMatch ? `${browserMatch[1]} Browser` : "Unknown Browser";
};

module.exports = mongoose.model("Device", deviceSchema);