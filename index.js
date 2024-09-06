const axios = require("axios");
const fs = require("fs");
const { Command } = require("commander");

const program = new Command();
const app = require("express")();

const cache = JSON.parse(fs.readFileSync(__dirname + "\\cache.json", "utf8"));
let server;

program
  .name("caching-proxy")
  .description("A CLI tool for running a caching proxy server")
  .version("1.0.0");

program
  .command("start")
  .requiredOption("-p, --port <number>", "Port Number", (value) => {
    const port = parseInt(value, 10);
    if (port < 1024 || port > 65535) {
      throw new Error("Port number must be between 1024 and 65535");
    }
    return port;
  })
  .requiredOption("-o, --origin <url>", "Origin URL", (url) => {
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error("Invalid URL format");
    }
  })
  .action((options) => {
    if (options.origin in cache) {
      console.time("Execution Time");
      const cachedResponse = cache[options.origin];
      cachedResponse.headers["X-Cache"] = "HIT";
      console.log(cachedResponse.headers["X-Cache"]);
    } else {
      console.time("Execution Time");
      server = app.listen(options.port, () =>
        console.log(`Listening on port ${options.port}`)
      );
      axios
        .get(options.origin)
        .then((result) => {
          const { status, headers, data } = result;
          const response = (cache[options.origin] = {
            status,
            headers,
            data,
          });
          fs.writeFileSync(__dirname + "//cache.json", JSON.stringify(cache));
          response.headers["X-Cache"] = "MISS";
          console.log(response.headers["X-Cache"]);
          stopServer();
        })
        .catch((err) => console.error(err));
    }
  });

program
  .command("clear-cache")
  .option("--clear-cache", "Clear the cache before running")
  .action(() => {
    try {
      fs.writeFileSync(__dirname + "//cache.json", "{}");
      console.log("Cache was cleared!");
    } catch (error) {
      console.error(`There was a problem clearing the cache: ${error.message}`);
    }
  });
program.parse(process.argv);

if (program.args[0] !== "clear-cache") {
  console.timeEnd("Execution Time");
}

function stopServer() {
  if (server) {
    server.close(() => {
      console.log("Server stopped.");
    });
  } else {
    console.log("Server is not running.");
  }
}
