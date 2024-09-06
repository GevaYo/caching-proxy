const crypto = require("crypto");

function generateCacheKey(url, method = "GET") {
  const key = `${method}:${url}`;
  return crypto.createHash("sha256").update(key).digest("hex");
}

module.exports = {
  generateCacheKey,
};
