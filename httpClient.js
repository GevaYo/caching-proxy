const axios = require("axios");

class HttpClient {
  static async fetchFromOrigin(url) {
    try {
      const response = await axios.get(url);
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      console.error(`Error fetching from origin: ${error.message}`);
      return null;
    }
  }
}

module.exports = HttpClient;
