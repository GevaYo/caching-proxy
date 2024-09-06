const redis = require("redis");

class CacheManager {
  constructor() {
    this.client = redis.createClient({
      url: "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    this.client.connect().catch((err) => {
      console.error("Failed to connect to Redis", err);
    });
  }

  async getCache(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Error getting cache", err);
      throw err;
    }
  }

  async setCache(key, value) {
    try {
      await this.client.setEx(key, 300, JSON.stringify(value));
    } catch (err) {
      console.error("Error setting cache", err);
      throw err;
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
      throw err;
    }
  }
}

module.exports = CacheManager;
