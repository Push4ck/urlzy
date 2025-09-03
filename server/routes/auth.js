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
  await user.save();

  const appName = process.env.APP_NAME || "URLzy";
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
}

// =====================
// Registration
// =====================
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email or username already exists",
        });
    }

    const user = new User({ username, email, password });
    await user.save();

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
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
});

// =====================
// Profile
// =====================
router.get("/profile", authenticate, async (req, res) => {
  return res.json({ success: true, data: req.user });
});

// =====================
// Login with optional 2FA and email verification gating
// =====================
router.post("/login", validateLogin, async (req, res) => {
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

    // Block login until email verified
    if (!user.verified) {
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
      return res
        .status(429)
        .json({
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
router.post("/verify-email/request", validateEmailOnly, async (req, res) => {
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
      return res
        .status(429)
        .json({
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
});

router.post(
  "/verify-email/verify",
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
        return res
          .status(429)
          .json({
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
        return res
          .status(429)
          .json({
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
router.post("/forgot-password/verify", validateOtpVerify, async (req, res) => {
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
});

// 3) Reset password using OTP + resetToken
router.post(
  "/forgot-password/reset",
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
