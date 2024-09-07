# Caching Proxy

A simple and efficient [caching proxy](https://roadmap.sh/projects/caching-server) server built with Node.js and Redis.

## Features

- Proxies HTTP requests to a specified origin server
- Caches responses in Redis for improved performance
- CLI tool for easy management
- Configurable port and origin URL
- Cache clearing functionality

## Prerequisites

- Node.js (v14 or later)
- Redis server running locally on default port (6379)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/GevaYo/caching-proxy.git
   cd caching-proxy
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

### Starting the proxy server

To start the proxy server, use the following command:
```
node cli.js --port <port> --origin <origin>
```

To clear the proxy cache, use the following command:
```
node cli.js clear-cache
```