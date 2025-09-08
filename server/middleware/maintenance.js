const Settings = require("../models/Settings");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

/**
 * Middleware to check if the system is in maintenance mode
 * If maintenance mode is enabled, returns a 503 Service Unavailable response
 * Allows admin users to bypass maintenance mode
 */
const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for health checks, maintenance status, frontend routes, and URL redirects
    if (
      req.path.startsWith('/health') ||
      req.path === '/api/maintenance/status' ||
      !req.path.startsWith('/api') // Allow all non-API routes (frontend and URL redirects)
    ) {
      return next();
    }

    const settings = await Settings.getSettings();

    if (settings.enableMaintenanceMode) {
      // Check if user is authenticated and is an admin
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7); // Remove "Bearer " prefix
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "dev_secret_change_me"
          );

          const user = await User.findById(decoded.userId).select("-password");

          // If user is authenticated and is an admin, allow them to bypass maintenance
          if (user && user.role === "admin") {
            logger.info("Admin user bypassing maintenance mode", {
              userId: user._id,
              username: user.username,
              path: req.path
            });
            return next();
          }
        } catch (authError) {
          // Token is invalid, continue with maintenance check
          logger.debug("Invalid token during maintenance check", { error: authError.message });
        }
      }

      // Skip maintenance check for essential auth endpoints (login, register, password reset, etc.)
      if (
        req.path === '/api/auth/login' ||
        req.path === '/api/auth/admin-login' ||
        req.path === '/api/auth/register' ||
        req.path === '/api/auth/forgot-password/request' ||
        req.path === '/api/auth/forgot-password/verify' ||
        req.path === '/api/auth/forgot-password/reset' ||
        req.path === '/api/auth/verify-email' ||
        req.path === '/api/auth/verify-email/request' ||
        req.path === '/api/auth/verify-email/verify'
      ) {
        return next();
      }

      logger.warn("Request blocked due to maintenance mode", {
        path: req.path,
        method: req.method,
        ip: req.ip,
        hasAuth: !!authHeader
      });

      return res.status(503).json({
        success: false,
        message: "System is under maintenance. Please try again later.",
        maintenance: true
      });
    }

    next();
  } catch (error) {
    logger.error("Error checking maintenance mode", { error: error.message });
    // If there's an error checking maintenance mode, allow the request to proceed
    next();
  }
};

module.exports = {
  checkMaintenanceMode
};