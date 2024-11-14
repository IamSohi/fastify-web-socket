// Import dependencies
const fastify = require('fastify')({
  logger: true, // Enable logging for fastify
});
const { WebsocketServer } = require('y-websocket'); // y-websocket integration
const WebSocket = require('ws');
const http = require('http');
const crypto = require('webcrypto-shim');
global.crypto = crypto;

// Create an HTTP server for Fastify
const server = http.createServer(fastify.server);

// Create WebSocket server (for WebSocket upgrades)
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Set up y-websocket to handle Yjs document synchronization
const yws = new WebsocketServer({
  server: server, // Pass the HTTP server to y-websocket
  verifyClient: (info, next) => {
    // Implement your client verification (e.g., token-based auth)
    next(true); // Allow all clients for now
  },
});

// Fastify routes (optional)
fastify.get('/', async (request, reply) => {
  return { message: 'Welcome to the Collaborative Writing Platform' };
});

// Start Fastify server and WebSocket server
const port = 4321;
server.listen(port, () => {
  console.log(`WebSocket server running at ws://localhost:${port}`);
});

// Start Fastify HTTP server
fastify.listen(port, '0.0.0.0', (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
