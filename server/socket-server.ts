import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './utils/mongoose';
import type { SocketMaps } from './types/socket.types';
import { BroadcastService } from './services/BroadcastService';
import { ConnectionManager } from './services/ConnectionManager';
import { SocketEventHandlers } from './handlers/SocketEventHandlers';
import { CleanupService } from './services/CleanupService';
import { Message } from './models/Message';

const startSocketServer = async () => {
  await connectDB();
  
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Initialize socket maps
  const socketMaps: SocketMaps = {
    userMap: new Map<string, string>(),
    userSockets: new Map<string, string>(),
    disconnectTimeouts: new Map<string, NodeJS.Timeout>()
  };

  // Initialize services
  const broadcastService = new BroadcastService(io, socketMaps);
  const connectionManager = new ConnectionManager(socketMaps, broadcastService);
  const eventHandlers = new SocketEventHandlers(connectionManager, broadcastService, socketMaps);
  const cleanupService = new CleanupService(connectionManager, broadcastService, socketMaps);

  // Register socket event handlers
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);
    
    // Register both connection and message handlers
    eventHandlers.registerHandlers(socket);
  });

  // Start cleanup service
  cleanupService.startCleanupInterval();

  const PORT = process.env.SOCKET_PORT || 3002;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
    console.log(`📡 CORS enabled for: http://localhost:3000, http://localhost:3001`);
  });
};

startSocketServer().catch((error) => {
  console.error('❌ Error starting Socket.IO server:', error);
  process.exit(1);
});

