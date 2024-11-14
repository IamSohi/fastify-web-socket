// server.js

const http = require('http');
const WebSocket = require('ws');
const fastify = require('fastify')({
  logger: true
});
const { WebsocketProvider } = require('y-websocket'); // The correct import for WebSocket provider
const Y = require('yjs'); // yjs for document synchronization

// Create a simple HTTP server
const server = http.createServer(fastify);

// WebSocket server setup using the ws library
const wss = new WebSocket.Server({ noServer: true });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Handling WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Initialize Yjs document and WebSocket provider
const ydoc = new Y.Doc(); // Create a new Yjs document

// WebSocket provider for Yjs (this synchronizes the Yjs document across clients)
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'roomname', ydoc);

// When clients are connected to WebSocket, they will synchronize their changes to `ydoc`
wsProvider.on('status', (event) => {
  console.log('WebSocket provider status: ', event.status);
});

// Start Fastify server
fastify.listen(process.env.PORT || 8080, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
