// server/middleware/redisRateLimiter.js
const { RateLimiterRedis, RateLimiterMemory } = require("rate-limiter-flexible");
const Redis = require("ioredis");

const hasRedis = !!process.env.REDIS_URL;
let limiter;

if (hasRedis) {
  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rl-shortens",
    points: 5, // 5 creates
    duration: 24 * 3600, // per 24h
  });
} else {
  // Fallback in-memory limiter so production without REDIS_URL still works
  limiter = new RateLimiterMemory({
    points: 5,
    duration: 24 * 3600,
    keyPrefix: "rl-shortens"
  });
}

async function anonShortenRateLimit(req, res, next) {
  if (req.user) return next();
  try {
    await limiter.consume(req.ip);
    return next();
  } catch (e) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please sign in for higher limits.",
    });
  }
}

module.exports = { anonShortenRateLimit };
