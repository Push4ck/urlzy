const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs = 24 * 60 * 60 * 1000, max = 5) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: `Rate limit exceeded. Maximum ${max} requests per ${
        windowMs / (1000 * 60 * 60)
      } hours.`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = createRateLimiter;
