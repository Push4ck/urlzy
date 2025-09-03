// server/utils/cache.js
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // Let ioredis auto-connect on first command
});

async function connectOnce() {
  // Ensure connected if not ready
  if (redis.status !== "ready" && redis.status !== "connecting") {
    await redis.connect();
  }
}

async function get(key) {
  try {
    await connectOnce();
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null; // fail-open on cache errors
  }
}

async function set(key, value, ttlSeconds = 300) {
  try {
    await connectOnce();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (e) {
    // ignore cache errors
  }
}

async function del(key) {
  try {
    await connectOnce();
    await redis.del(key);
  } catch (e) {
    // ignore cache errors
  }
}

module.exports = { get, set, del };
