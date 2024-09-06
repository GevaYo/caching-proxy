const HttpClient = require("./httpClient");
const CacheManager = require("./CacheManager");
const { generateCacheKey } = require("./utils");

const cacheManager = new CacheManager();

async function handleRequest(url) {
  try {
    const cacheKey = generateCacheKey(url);
    console.log(`Generated cache key: ${cacheKey}`);

    const cachedResponse = await cacheManager.getCache(cacheKey);
    if (cachedResponse) {
      cachedResponse.headers["X-Cache"] = "HIT";
      console.log("Cache HIT:", cachedResponse);
      return cachedResponse;
    }

    console.log("Cache miss. Fetching from origin...");
    const response = await HttpClient.fetchFromOrigin(url);
    if (response) {
      await cacheManager.setCache(cacheKey, response);
      response.headers["X-Cache"] = "MISS";
      console.log("Fetched from origin and cached:", response);
    }

    return response;
  } catch (error) {
    console.error("Error in handleRequest:", error);
    throw error;
  } finally {
    await cacheManager.close();
  }
}

async function clearCache() {
  try {
    await cacheManager.clearCache();
  } catch (error) {
    console.error(`Failed clearing the cache: ${error.message}`);
  } finally {
    await cacheManager.close();
  }
}
// // Cleanup function to close Redis connection
// function cleanup() {
//   cacheManager
//     .close()
//     .then(() => {
//       console.log("Cleanup complete, exiting...");
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error("Error during cleanup:", err);
//       process.exit(1);
//     });
// }
//
// // Handle process exit events
// process.on("SIGINT", cleanup);
// process.on("SIGTERM", cleanup);
// process.on("exit", cleanup);

module.exports = { handleRequest, clearCache };
