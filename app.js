// Import required libraries
const http = require('http');
const WebSocket = require('ws'); // Import ws to handle WebSocket
const fastify = require('fastify')({ logger: true });
const { WebsocketServer } = require('y-websocket'); // y-websocket for real-time collaboration
const Y = require('yjs'); // Yjs for collaborative document synchronization

// Create a Fastify HTTP server
const server = http.createServer(fastify);

// Create a WebSocket server using ws
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections and messages
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// When the HTTP server gets an upgrade request (for WebSocket), forward it to the ws WebSocket server
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Create a Yjs document
const ydoc = new Y.Doc();

// WebSocket provider for Yjs - this allows syncing of the Yjs document across WebSocket connections
const wsProvider = new WebsocketServer({
  server: server,      // Pass the HTTP server to y-websocket
  wss: wss,            // Pass the WebSocket server to y-websocket
  verifyClient: (info, next) => {
    console.log('Client connected:', info.req.socket.remoteAddress);
    next(true); // Accept all clients (you can add custom validation here)
  }
});

// Handle WebSocket provider status
wsProvider.on('status', (event) => {
  console.log('WebSocket provider status:', event.status);
});

// Start the Fastify server
fastify.listen(process.env.PORT || 8080, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
