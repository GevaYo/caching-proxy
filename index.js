const HttpClient = require("./httpClient");
const CacheManager = require("./CacheManager");
const express = require("express");
const { generateCacheKey } = require("./utils");

const cacheManager = new CacheManager();

async function handleRequest(url) {
  const cacheKey = generateCacheKey(url);
  console.log(`Generated cache key: ${cacheKey}`);

  try {
    const cachedResponse = await cacheManager.getCache(cacheKey);
    if (cachedResponse) {
      console.log("Cache HIT:", cachedResponse);
      return { ...cachedResponse, headers: { ...cachedResponse.headers, "X-Cache": "HIT" } };
    }

    console.log("Cache miss. Fetching from origin...");
    const response = await HttpClient.fetchFromOrigin(url);
    if (response) {
      await cacheManager.setCache(cacheKey, response);
      console.log("Fetched from origin and cached:", response);
      return { ...response, headers: { ...response.headers, "X-Cache": "MISS" } };
    }

    throw new Error("Failed to fetch from origin");
  } catch (error) {
    console.error("Error in handleRequest:", error);
    throw error;
  }
}

function createProxyServer(port, originUrl) {
  const app = express();

  app.use(async (req, res) => {
    const url = new URL(req.url, originUrl);
    console.log(`Request URL: ${url}`);
    try {
      const response = await handleRequest(url.toString());
      
      Object.entries(response.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
      
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  return app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
    console.log(`Forwarding requests to origin: ${originUrl}`);
  });
}

async function clearCache() {
  try {
    await cacheManager.clearCache();
    console.log('Cache cleared');
  } catch (error) {
    console.error(`Failed clearing the cache: ${error.message}`);
  }
}

async function shutdown() {
  console.log('Shutting down...');
  try {
    await cacheManager.close();
    console.log('Redis connection closed');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
}

module.exports = { createProxyServer, clearCache, shutdown };
