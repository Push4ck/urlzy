const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  validateRegistration,
  validateLogin,
  validateForgotRequest,
  validateOtpVerify,
  validateResetPassword,
  validateEmailOnly,
  validateEmailOtpVerify,
  validateLoginOtpVerify,
} = require("../middleware/validator");
const { authenticate } = require("../middleware/auth");
const { sendEmail } = require("../utils/email");
// Rate limit auth endpoints
const createRateLimiter = require("../middleware/rateLimiter");
const authLimiter = createRateLimiter(15 * 60 * 1000, 20); // 20 requests per 15 min per IP

// Configurable OTP settings via env
const OTP_DEFAULT_LENGTH = parseInt(process.env.OTP_LENGTH || "6", 10);
const OTP_DEFAULT_TTL_MINUTES = parseInt(
  process.env.OTP_TTL_MINUTES || "10",
  10
);
const OTP_RESEND_SECONDS = parseInt(process.env.OTP_RESEND_SECONDS || "60", 10);

// helper to generate numeric OTP of given length
function generateOtp(length = OTP_DEFAULT_LENGTH) {
  const len = Math.max(4, Math.min(8, length));
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

async function setAndSendOtp({
  user,
  kind, // 'reset' | 'verify' | '2fa'
  subject,
  textPrefix,
  htmlPrefix,
  ttlMinutes = OTP_DEFAULT_TTL_MINUTES,
}) {
  const otp = generateOtp();
  console.log(`[OTP DEBUG] Generated OTP for ${kind}: ${otp} for user ${user.email}`);
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);
  const now = new Date();
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000);

  if (kind === "reset") {
    user.resetOtpHash = otpHash;
    user.resetOtpExpires = expires;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = now;
  } else if (kind === "verify") {
    user.emailVerifyOtpHash = otpHash;
    user.emailVerifyOtpExpires = expires;
    user.emailVerifyOtpAttempts = 0;
    user.emailVerifyOtpLastSentAt = now;
  } else if (kind === "2fa") {
    user.twoFactorOtpHash = otpHash;
    user.twoFactorOtpExpires = expires;
    user.twoFactorOtpAttempts = 0;
    user.twoFactorOtpLastSentAt = now;
  }
  try {
    await user.save();
    console.log(`[OTP DEBUG] Saved OTP hash for ${kind} to user ${user.email}`);
  } catch (saveError) {
    console.error(`[OTP DEBUG] Failed to save user for ${kind}:`, saveError.message);
    throw saveError;
  }

  const appName = process.env.APP_NAME || "URLzy";
  console.log(`[OTP DEBUG] Sending email for ${kind} to ${user.email}`);
  await sendEmail({
    to: user.email,
    subject: subject || `${appName} OTP`,
    text: `${
      textPrefix || "Your OTP is"
    } ${otp}. It expires in ${ttlMinutes} minutes.`,
    html: `<p>${
      htmlPrefix || "Your OTP is"
    } <strong>${otp}</strong>. It expires in ${ttlMinutes} minutes.</p>`,
  });
  console.log(`[OTP DEBUG] Email sent successfully for ${kind} to ${user.email}`);
}

// =====================
// Registration
// =====================
router.post(
  "/register",
  authLimiter,
  validateRegistration,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      const user = new User({ username, email, password });
      await user.save();

      // Check if email verification is required based on admin settings
      if (adminSettings.requireEmailVerification) {
        await setAndSendOtp({
          user,
          kind: "verify",
          subject: "Verify your email",
          textPrefix: "Your email verification code is",
          htmlPrefix: "Your email verification code is",
        });

        return res.status(201).json({
          success: true,
          message: "Account created. We sent a verification code to your email.",
        });
      } else {
        // Auto-verify the user if email verification is disabled
        user.verified = true;
        await user.save();

        return res.status(201).json({
          success: true,
          message: "Account created successfully. Email verification is not required.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Error creating user" });
    }
  }
);

// =====================
// Profile
// =====================
router.get("/profile", authenticate, async (req, res) => {
  return res.json({ success: true, data: req.user });
});

// =====================
// Delete Account
// =====================
router.delete("/delete-account", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user's URLs first
    const Url = require("../models/Url");
    await Url.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// User Settings
// =====================
router.put("/settings", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allowedFields = ['emailNotifications', 'profileVisibility'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    Object.assign(user, updates);
    await user.save();

    return res.json({
      success: true,
      message: "Settings updated successfully",
      data: updates
    });
  } catch (error) {
    console.error("User settings update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Admin Stats
// =====================
router.get("/admin/stats", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const User = require("../models/User");
    const Url = require("../models/Url");

    const totalUsers = await User.countDocuments();
    const totalUrls = await Url.countDocuments();
    const totalClicks = await Url.aggregate([
      { $group: { _id: null, total: { $sum: "$clickCount" } } }
    ]);
    const activeUsers = await User.countDocuments({ verified: true });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalUrls,
        totalClicks: totalClicks[0]?.total || 0,
        activeUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Admin Settings
// =====================

// In-memory settings storage (in production, use database)
let adminSettings = {
  allowRegistration: true,
  requireEmailVerification: true,
  enableAnalytics: true,
};

router.get("/admin/settings", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({
      success: true,
      data: adminSettings
    });
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/admin/settings", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const allowedFields = ['allowRegistration', 'requireEmailVerification', 'enableAnalytics'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    // Update in-memory settings
    Object.assign(adminSettings, updates);
    console.log("Admin settings updated:", adminSettings);

    return res.json({
      success: true,
      message: "Admin settings updated successfully",
      data: updates
    });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Admin Users Management
// =====================
router.get("/admin/users", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/admin/users/:userId/role", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "User role updated successfully"
    });
  } catch (error) {
    console.error("Admin user role update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/admin/users/:userId/status", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId } = req.params;
    const { verified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.verified = verified;
    await user.save();

    return res.json({
      success: true,
      message: "User status updated successfully"
    });
  } catch (error) {
    console.error("Admin user status update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/admin/users/:userId/premium", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId } = req.params;
    const { premium } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.premium = premium;
    await user.save();

    return res.json({
      success: true,
      message: "User premium status updated successfully"
    });
  } catch (error) {
    console.error("Admin user premium update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/admin/users/:userId", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(userId);

    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Admin Analytics
// =====================
router.get("/admin/analytics", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const User = require("../models/User");
    const Url = require("../models/Url");
    const ClickEvent = require("../models/ClickEvent");

    const totalUsers = await User.countDocuments();
    const totalUrls = await Url.countDocuments();
    const totalClicks = await Url.aggregate([
      { $group: { _id: null, total: { $sum: "$clickCount" } } }
    ]);
    const activeUsers = await User.countDocuments({ verified: true });

    // Get top performing URLs
    const topUrls = await Url.find()
      .sort({ clickCount: -1 })
      .limit(10)
      .select('shortCode originalUrl clickCount');

    // Get recent activity (simplified)
    const recentActivity = await ClickEvent.find()
      .sort({ ts: -1 })
      .limit(20)
      .populate('urlId', 'shortCode userId')
      .populate('userId', 'username')
      .select('ts urlId userId');

    const formattedActivity = await Promise.all(recentActivity.map(async (event) => {
      let username = event.userId?.username || "Anonymous";

      // If no userId in click event but URL has an owner, show URL owner's username
      if (!event.userId && event.urlId?.userId) {
        try {
          const User = require("../models/User");
          const urlOwner = await User.findById(event.urlId.userId).select('username');
          if (urlOwner) {
            username = urlOwner.username;
          }
        } catch (err) {
          // Keep as Anonymous if lookup fails
        }
      }

      return {
        action: "URL Click",
        user: username,
        timestamp: event.ts,
        details: event.urlId?.shortCode || "Unknown"
      };
    }));

    // Generate user growth data for the last 30 days
    const userGrowth = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Count users created on this date
      const usersOnDate = await User.countDocuments({
        createdAt: {
          $gte: date,
          $lt: nextDate
        }
      });

      // Calculate cumulative users up to this date
      const cumulativeUsers = await User.countDocuments({
        createdAt: { $lt: nextDate }
      });

      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users: cumulativeUsers,
        newUsers: usersOnDate
      });
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalUrls,
        totalClicks: totalClicks[0]?.total || 0,
        activeUsers,
        topUrls,
        recentActivity: formattedActivity,
        userGrowth,
        clickTrends: [] // Placeholder for click trends data
      }
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Login with optional 2FA and email verification gating
// =====================
// Basic rate limiting to protect auth endpoints
router.post("/login", authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Block login until email verified (only if email verification is required)
    if (!user.verified && adminSettings.requireEmailVerification) {
      const now = new Date();
      if (
        !user.emailVerifyOtpLastSentAt ||
        now - user.emailVerifyOtpLastSentAt >= OTP_RESEND_SECONDS * 1000
      ) {
        await setAndSendOtp({
          user,
          kind: "verify",
          subject: "Verify your email",
          textPrefix: "Your email verification code is",
          htmlPrefix: "Your email verification code is",
        });
      }
      return res.status(403).json({
        success: false,
        message: "Email not verified. We have sent you a verification code.",
        requiresVerification: true,
      });
    }

    // If 2FA enabled, send OTP and return a short-lived login token (not full JWT)
    if (user.twoFactorEnabled) {
      const now = new Date();
      if (
        !user.twoFactorOtpLastSentAt ||
        now - user.twoFactorOtpLastSentAt >= OTP_RESEND_SECONDS * 1000
      ) {
        await setAndSendOtp({
          user,
          kind: "2fa",
          subject: "Your login verification code",
          textPrefix: "Your login verification code is",
          htmlPrefix: "Your login verification code is",
        });
      }

      const loginToken = jwt.sign(
        { userId: user._id, purpose: "2fa" },
        process.env.JWT_SECRET || "dev_secret_change_me",
        { expiresIn: "10m" }
      );

      return res.json({
        success: true,
        data: { twoFactorRequired: true, loginToken },
      });
    }

    // Normal login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          premium: user.premium,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error during login" });
  }
});

// Verify login 2FA OTP
router.post("/login/verify-otp", validateLoginOtpVerify, async (req, res) => {
  try {
    const { loginToken, otp } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(
        loginToken,
        process.env.JWT_SECRET || "dev_secret_change_me"
      );
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired login token" });
    }
    if (decoded.purpose !== "2fa") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token purpose" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.twoFactorOtpHash || !user.twoFactorOtpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    if (user.twoFactorOtpExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    if (user.twoFactorOtpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const match = await bcrypt.compare(otp, user.twoFactorOtpHash);
    user.twoFactorOtpAttempts += 1;
    if (!match) {
      await user.save();
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear 2FA OTP fields
    user.twoFactorOtpHash = null;
    user.twoFactorOtpExpires = null;
    user.twoFactorOtpAttempts = 0;
    user.twoFactorOtpLastSentAt = null;
    await user.save();

    // Issue full JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          premium: user.premium,
        },
      },
    });
  } catch (error) {
    console.error("Login 2FA verify error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Enable/Disable 2FA
// =====================
router.post("/2fa/enable", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.twoFactorEnabled = true;
    await user.save();
    return res.json({
      success: true,
      message: "Two-factor authentication enabled",
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/2fa/disable", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.twoFactorEnabled = false;
    // clear pending OTPs
    user.twoFactorOtpHash = null;
    user.twoFactorOtpExpires = null;
    user.twoFactorOtpAttempts = 0;
    user.twoFactorOtpLastSentAt = null;
    await user.save();
    return res.json({
      success: true,
      message: "Two-factor authentication disabled",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================
// Email verification endpoints
// =====================
router.post(
  "/verify-email/request",
  authLimiter,
  validateEmailOnly,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({
          success: true,
          message: "If the email exists, we sent a verification code.",
        });
      }
      if (user.verified) {
        return res.json({ success: true, message: "Email already verified." });
      }
      const now = new Date();
      if (
        user.emailVerifyOtpLastSentAt &&
        now - user.emailVerifyOtpLastSentAt < OTP_RESEND_SECONDS * 1000
      ) {
        return res.status(429).json({
          success: false,
          message: "Please wait a minute before requesting another code.",
        });
      }

      await setAndSendOtp({
        user,
        kind: "verify",
        subject: "Verify your email",
        textPrefix: "Your email verification code is",
        htmlPrefix: "Your email verification code is",
      });

      return res.json({
        success: true,
        message: "Verification code sent if the email exists.",
      });
    } catch (error) {
      console.error("Verify-email request error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

router.post(
  "/verify-email/verify",
  authLimiter,
  validateEmailOtpVerify,
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
      if (!user || !user.emailVerifyOtpHash || !user.emailVerifyOtpExpires) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }
      if (user.emailVerifyOtpExpires < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }
      if (user.emailVerifyOtpAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Too many attempts. Request a new OTP.",
        });
      }

      const match = await bcrypt.compare(otp, user.emailVerifyOtpHash);
      user.emailVerifyOtpAttempts += 1;
      if (!match) {
        await user.save();
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      user.verified = true;
      user.emailVerifyOtpHash = null;
      user.emailVerifyOtpExpires = null;
      user.emailVerifyOtpAttempts = 0;
      user.emailVerifyOtpLastSentAt = null;
      await user.save();

      return res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Verify-email verify error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// =====================
// Forgot Password (OTP)
// =====================
// 1) Request OTP
router.post(
  "/forgot-password/request",
  authLimiter,
  validateForgotRequest,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.json({
          success: true,
          message: "If the email exists, an OTP has been sent.",
        });
      }

      const now = new Date();
      if (
        user.resetOtpLastSentAt &&
        now - user.resetOtpLastSentAt < OTP_RESEND_SECONDS * 1000
      ) {
        return res.status(429).json({
          success: false,
          message: "Please wait a minute before requesting another OTP.",
        });
      }

      await setAndSendOtp({
        user,
        kind: "reset",
        subject: "Password Reset OTP",
        textPrefix: "Your OTP is",
        htmlPrefix: "Your OTP is",
      });

      return res.json({
        success: true,
        message: "OTP sent if the email exists.",
      });
    } catch (error) {
      console.error("Forgot-password request error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// 2) Verify OTP
router.post(
  "/forgot-password/verify",
  authLimiter,
  validateOtpVerify,
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
      if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      if (user.resetOtpExpires < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      if (user.resetOtpAttempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Too many attempts. Request a new OTP.",
        });
      }

      const match = await bcrypt.compare(otp, user.resetOtpHash);
      user.resetOtpAttempts += 1;

      if (!match) {
        await user.save();
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const resetToken = jwt.sign(
        { email },
        process.env.JWT_SECRET || "dev_secret_change_me",
        { expiresIn: "10m" }
      );

      await user.save();
      return res.json({ success: true, data: { resetToken } });
    } catch (error) {
      console.error("Forgot-password verify error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// 3) Reset password using OTP + resetToken
router.post(
  "/forgot-password/reset",
  authLimiter,
  validateResetPassword,
  async (req, res) => {
    try {
      const { email, otp, newPassword, resetToken } = req.body;

      if (resetToken) {
        try {
          const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET || "dev_secret_change_me"
          );
          if (decoded.email !== email) {
            return res
              .status(400)
              .json({ success: false, message: "Invalid reset token" });
          }
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
          });
        }
      }

      const user = await User.findOne({ email });
      if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      if (user.resetOtpExpires < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const match = await bcrypt.compare(otp, user.resetOtpHash);
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      user.password = newPassword;
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      user.resetOtpAttempts = 0;
      user.resetOtpLastSentAt = null;

      await user.save();

      return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.error("Forgot-password reset error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
