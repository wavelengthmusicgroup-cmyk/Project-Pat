#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, url.parse(req.url).pathname);

  // Default to index.html for directories
  fs.stat(filePath, (err, stats) => {
    if (err || stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
        console.log(`404: ${req.url}`);
        return;
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
      console.log(`200: ${req.url} -> ${path.relative(ROOT, filePath)}`);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${ROOT}`);
  console.log(`Press Ctrl+C to stop`);
});
