// server/utils/cache.js
const Redis = require("ioredis");

const hasRedis = !!process.env.REDIS_URL;
let redis = null;

if (hasRedis) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });
}

async function connectOnce() {
  if (!hasRedis) return; // no-op when Redis disabled
  if (redis.status !== "ready" && redis.status !== "connecting") {
    await redis.connect();
  }
}

async function get(key) {
  try {
    if (!hasRedis) return null;
    await connectOnce();
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null; // fail-open on cache errors
  }
}

async function set(key, value, ttlSeconds = 300) {
  try {
    if (!hasRedis) return; // no-op
    await connectOnce();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (e) {
    // ignore cache errors
  }
}

async function del(key) {
  try {
    if (!hasRedis) return; // no-op
    await connectOnce();
    await redis.del(key);
  } catch (e) {
    // ignore cache errors
  }
}

module.exports = { get, set, del };
