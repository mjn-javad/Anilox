const Redis = require("ioredis");
const configs = require("../configs");

const redis = new Redis({
  host: configs.redisDB.host || "localhost",
  port: configs.redisDB.port || 6379,
  password: configs.redisDB.password || undefined,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redis;
