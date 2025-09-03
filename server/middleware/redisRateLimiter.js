// server/middleware/redisRateLimiter.js
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl-shortens",
  points: 5, // 5 creates
  duration: 24 * 3600, // per 24h
});

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
