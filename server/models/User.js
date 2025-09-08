const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    premium: {
      type: Boolean,
      default: false,
    },
    urlsCreated: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // Email verification OTP fields
    emailVerifyOtpHash: { type: String, default: null },
    emailVerifyOtpExpires: { type: Date, default: null },
    emailVerifyOtpAttempts: { type: Number, default: 0 },
    emailVerifyOtpLastSentAt: { type: Date, default: null },

    // Password reset OTP fields
    resetOtpHash: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    resetOtpLastSentAt: {
      type: Date,
      default: null,
    },

    // Two-factor authentication (email OTP at login)
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorOtpHash: { type: String, default: null },
    twoFactorOtpExpires: { type: Date, default: null },
    twoFactorOtpAttempts: { type: Number, default: 0 },
    twoFactorOtpLastSentAt: { type: Date, default: null },

    // User preferences/settings
    emailNotifications: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, enum: ['en', 'es', 'fr', 'de'], default: 'en' },
    profileImage: { type: String, default: null },

    // Pending email change (for email verification)
    pendingEmail: { type: String, default: null },

    // Notification preferences
    notifications: {
      urlClicks: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      systemUpdates: { type: Boolean, default: true }
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
