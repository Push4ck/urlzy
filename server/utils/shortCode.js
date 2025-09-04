const Url = require("../models/Url");

// Base62 characters (a-z, A-Z, 0-9)
const BASE62_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Reserved codes to prevent conflicts with routes and system paths
const RESERVED_CODES = new Set([
  "api",
  "health",
  "login",
  "register",
  "billing",
  "profile",
  "admin",
]);

/**
 * Generates a random short code
 * @param {number} length - Length of the short code
 * @returns {string} Random short code
 */
function generateRandomCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS.charAt(
      Math.floor(Math.random() * BASE62_CHARS.length)
    );
  }
  return result;
}

/**
 * Generates a unique short code by checking database
 * @param {number} length - Length of the short code
 * @returns {Promise<string>} Unique short code
 */
async function generateUniqueCode(length = 6) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRandomCode(length);

    // Check if code already exists
    const existingUrl = await Url.findOne({
      $or: [{ shortCode: code }, { customCode: code }],
    });

    if (!existingUrl && !RESERVED_CODES.has(code.toLowerCase())) {
      return code;
    }

    attempts++;
  }

  // If we can't find a unique code in 6 chars, try 7 chars
  if (length < 8) {
    return generateUniqueCode(length + 1);
  }

  throw new Error("Unable to generate unique short code");
}

/**
 * Validates if a custom code is available
 * @param {string} customCode - Custom code to check
 * @returns {Promise<boolean>} True if available
 */
async function isCustomCodeAvailable(customCode) {
  // Enforce single path segment and non-empty
  if (typeof customCode !== "string") return false;
  const normalized = customCode.trim().toLowerCase();
  if (!normalized.length) return false;
  if (normalized.includes("/")) return false;
  if (RESERVED_CODES.has(normalized)) return false;

  // Check if already exists (case-insensitive by comparing lowercased fields)
  const existingUrl = await Url.findOne({
    $or: [{ shortCode: normalized }, { customCode: normalized }],
  });

  return !existingUrl;
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = {
  generateUniqueCode,
  isCustomCodeAvailable,
  isValidUrl,
  RESERVED_CODES,
};
