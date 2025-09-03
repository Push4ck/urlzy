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
} = require("../middleware/validator");
const { sendEmail } = require("../utils/email");

// helper to generate 6-digit numeric OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register new user
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
});

// Login user
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "dev_secret_change_me",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
    });
  }
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// =====================
// Forgot Password (OTP)
// =====================

// 1) Request OTP
router.post(
  "/forgot-password/request",
  validateForgotRequest,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      // Always respond success to avoid user enumeration
      if (!user) {
        return res.json({
          success: true,
          message: "If the email exists, an OTP has been sent.",
        });
      }

      // Rate limit per-user: max 1 send per 60s, keep simple
      const now = new Date();
      if (
        user.resetOtpLastSentAt &&
        now - user.resetOtpLastSentAt < 60 * 1000
      ) {
        return res
          .status(429)
          .json({
            success: false,
            message: "Please wait a minute before requesting another OTP.",
          });
      }

      const otp = generateOtp();

      // Hash OTP before storing
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(otp, salt);

      user.resetOtpHash = otpHash;
      user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      user.resetOtpAttempts = 0;
      user.resetOtpLastSentAt = new Date();
      await user.save();

      // Send email (falls back to console in dev)
      const appName = process.env.APP_NAME || "URLzy";
      await sendEmail({
        to: user.email,
        subject: `${appName} Password Reset OTP`,
        text: `Your OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>`,
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
router.post("/forgot-password/verify", validateOtpVerify, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    // Always generic response
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

    // Limit attempts
    if (user.resetOtpAttempts >= 5) {
      return res
        .status(429)
        .json({
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

    // On success, return a short-lived token to allow password reset
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "10m" }
    );

    // Do not clear OTP yet; clear after successful reset
    await user.save();
    return res.json({ success: true, data: { resetToken } });
  } catch (error) {
    console.error("Forgot-password verify error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3) Reset password using OTP + resetToken
router.post(
  "/forgot-password/reset",
  validateResetPassword,
  async (req, res) => {
    try {
      const { email, otp, newPassword, resetToken } = req.body;

      // Validate resetToken if provided
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
          return res
            .status(400)
            .json({
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

      // Update password (pre-save hook will hash it)
      user.password = newPassword;
      // Clear OTP fields
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
