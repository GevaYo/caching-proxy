const redis = require("redis");

class CacheManager {
  constructor(redisUrl = "redis://localhost:6379", expirationTime = 300) {
    this.client = redis.createClient({ url: redisUrl });
    this.expirationTime = expirationTime;

    this.client.on("error", (err) => console.error("Redis Client Error", err));

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      console.error("Failed to connect to Redis", err);
    }
  }

  async getCache(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Error getting cache", err);
      return null; // Return null instead of throwing
    }
  }

  async setCache(key, value) {
    try {
      await this.client.setEx(key, this.expirationTime, JSON.stringify(value));
    } catch (err) {
      console.error("Error setting cache", err);
      // Don't throw, just log the error
    }
  }

  async clearCache() {
    try {
      await this.client.flushAll();
    } catch (err) {
      console.error("Error clearing cache", err);
      throw err;
    }
  }

  async close() {
    try {
      await this.client.quit();
    } catch (err) {
      console.error("Error closing Redis client", err);
      // Don't throw, just log the error
    }
  }
}

module.exports = CacheManager;
