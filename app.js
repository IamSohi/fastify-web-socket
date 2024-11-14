// server.js

const http = require("http");
const WebSocket = require("ws");
const Fastify = require("fastify");
const { WebsocketServer } = require("y-websocket");  // Import correctly
const fastify = Fastify({
  logger: true,
});

// Create a simple HTTP server
const server = http.createServer();

// Create a WebSocket server using `ws` library
const wss = new WebSocket.Server({ noServer: true });

// Listen for WebSocket connection
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  // Handle incoming messages from the client
  ws.on("message", (message) => {
    console.log("Received message:", message);
  });

  // When the WebSocket is closed
  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });
});

// Initialize the y-websocket server (no need for `new` keyword)
const yws = WebsocketServer({
  server,   // Pass the HTTP server to y-websocket
  wss,      // Pass the WebSocket server to y-websocket
  verifyClient: (info, next) => {
    console.log("Client connected:", info.req.socket.remoteAddress);
    next(true); // Allow all clients (you can add custom validation)
  }
});

// WebSocket upgrade handling
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Start the Fastify server
fastify.listen(8080, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
