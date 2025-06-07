import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './utils/mongoose';
import type { SocketMaps } from './types/socket.types';
import { BroadcastService } from './services/BroadcastService';
import { ConnectionManager } from './services/ConnectionManager';
import { SocketEventHandlers } from './handlers/SocketEventHandlers';
import { CleanupService } from './services/CleanupService';

const startSocketServer = async () => {
  await connectDB();
  
  const httpServer = createServer();
  
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    // Prioritas polling dulu untuk stabilitas
    transports: ['polling', 'websocket'],
    // Timeout settings yang lebih generous
    pingTimeout: 60000,
    pingInterval: 25000,
    // Upgrade settings
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    // Allow EIO3 untuk kompatibilitas
    allowEIO3: true
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

  // Debug middleware
  io.engine.on("connection_error", (err) => {
    console.log('🔴 Connection error:', err.req);
    console.log('🔴 Error code:', err.code);
    console.log('🔴 Error message:', err.message);
    console.log('🔴 Error context:', err.context);
  });

  // Register socket event handlers
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id} via ${socket.conn.transport.name}`);
    
    // Register both connection and message handlers
    eventHandlers.registerHandlers(socket);
    
    socket.on('error', (error) => {
      console.error(`🔴 Socket ${socket.id} error:`, error);
    });
  });

  // Start cleanup service
  cleanupService.startCleanupInterval();

  const PORT = Number(process.env.SOCKET_PORT) || 3002;
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
    console.log(`📡 CORS enabled for multiple origins`);
    console.log(`🔧 Transports: polling, websocket`);
  });
  
  // Handle server errors
  httpServer.on('error', (error) => {
    console.error('❌ HTTP Server error:', error);
  });
};

startSocketServer().catch((error) => {
  console.error('❌ Error starting Socket.IO server:', error);
  process.exit(1);
});