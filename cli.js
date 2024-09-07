const { Command } = require("commander");
const { createProxyServer, clearCache, shutdown } = require("./index");

const validatePort = (value) => {
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    throw new Error("Port number must be between 1024 and 65535");
  }
  return port;
};

const validateURL = (url) => {
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new Error("Invalid URL format");
  }
};

const handleGracefulShutdown = (server) => {
  process.on('SIGINT', async () => {
    server.close(async () => {
      await shutdown();
      process.exit(0);
    });
  });
};

const program = new Command();

program
  .name("caching-proxy")
  .description("A CLI tool for running a caching proxy server")
  .version("1.0.0");

program
  .command("start")
  .requiredOption("-p, --port <number>", "Port Number", validatePort)
  .requiredOption("-o, --origin <url>", "Origin URL", validateURL)
  .action(async ({ port, origin }) => {
    const server = createProxyServer(port, origin);
    handleGracefulShutdown(server);
  });

program
  .command("clear-cache")
  .description("Clear the cache")
  .action(async () => {
    await clearCache();
    process.exit(0);
  });

program.parse(process.argv);
