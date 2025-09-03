const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

const urlValidationRules = () => {
  return [
    body("originalUrl")
      .trim()
      .isURL()
      .withMessage("Please provide a valid URL"),
    body("customCode")
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Custom code must be 3-20 characters long and contain only letters and numbers"
      ),
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

module.exports = {
  urlValidationRules,
  validateRegistration,
  validateLogin,
  validate,
};
