const { body, param, validationResult } = require("express-validator");

// Keep OTP validators in sync with generator length
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "6", 10);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    return res.status(400).json({
      success: false,
      message: arr[0]?.msg || "Validation error",
      errors: arr,
    });
  }
  next();
};

const urlValidationRules = () => {
  return [
    body("originalUrl")
      .trim()
      // Allow URLs without protocol; we'll default to https:// below
      .customSanitizer((value) => {
        if (typeof value !== "string") return value;
        const v = value.trim();
        if (!/^https?:\/\//i.test(v) && /\./.test(v)) {
          return `https://${v}`;
        }
        return v;
      })
      .isURL({ require_protocol: false, require_host: true })
      .withMessage("Please provide a valid URL"),
    // Enforce custom code constraints for consistency with UI and routing
    body("customCode")
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .custom((value, { req }) => {
        // If customCode is not provided or is empty, skip validation
        if (!value || value.length === 0) {
          // Remove customCode from the request body to prevent it from being set
          delete req.body.customCode;
          return true;
        }
        if (value.length < 3 || value.length > 20) {
          throw new Error("Custom code must be 3–20 characters");
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          throw new Error("Only letters, numbers, underscores, and hyphens are allowed");
        }
        return true;
      }),
  ];
};

const validateRegistration = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
];

const validateLogin = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password").exists().withMessage("Password is required"),
  validate,
];

// Forgot password validators
const validateForgotRequest = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  validate,
];

const validateOtpVerify = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("otp")
    .trim()
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .isNumeric()
    .withMessage("Invalid OTP"),
  validate,
];

const validateResetPassword = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("otp")
    .trim()
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .isNumeric()
    .withMessage("Invalid OTP"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

// Email verify / request
const validateEmailOnly = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  validate,
];

const validateEmailOtpVerify = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("otp")
    .trim()
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .isNumeric()
    .withMessage("Invalid OTP"),
  validate,
];

// Login 2FA verify
const validateLoginOtpVerify = [
  body("loginToken").isString().withMessage("loginToken is required"),
  body("otp")
    .trim()
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .isNumeric()
    .withMessage("Invalid OTP"),
  validate,
];

module.exports = {
  urlValidationRules,
  validateRegistration,
  validateLogin,
  validateForgotRequest,
  validateOtpVerify,
  validateResetPassword,
  validateEmailOnly,
  validateEmailOtpVerify,
  validateLoginOtpVerify,
  validate,
};
