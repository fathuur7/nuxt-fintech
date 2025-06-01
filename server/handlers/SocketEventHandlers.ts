import { Socket } from 'socket.io';
import { ConnectionManager } from '../services/ConnectionManager';
import { User } from '../models/User';
import  { BroadcastService } from '../services/BroadcastService';
import type { SocketMaps } from '../types/socket.types';

export class SocketEventHandlers {
  constructor(
    private connectionManager: ConnectionManager,
    private broadcastService: BroadcastService,
    private socketMaps: SocketMaps
  ) {}

  registerHandlers(socket: Socket): void {
    console.log('🔌 New connection:', socket.id);

    socket.on('user-active', (userId: string) => {
      this.connectionManager.handleUserActive(userId, socket.id);
    });

    socket.on('user-offline', (userId: string) => {
      console.log(`🔴 User ${userId} explicitly going offline`);
      this.connectionManager.handleUserOffline(userId, socket.id, 'explicit');
    });

    socket.on('user-beforeunload', (userId: string) => {
      console.log(`📄 User ${userId} closing page/tab`);
      this.connectionManager.handleUserOffline(userId, socket.id, 'beforeunload');
    });

    socket.on('force-user-offline', async (userId: string) => {
      console.log(`💥 Admin forcing user ${userId} offline`);
      await this.connectionManager.handleUserOffline(userId, socket.id, 'force_offline');
      
      // Send specific event for force offline
      const user = await User.findById(userId);
      if (user) {
        this.broadcastService.broadcastForceOffline(userId, user);
      }
    });

    socket.on('user-idle', (userId: string) => {
      this.connectionManager.handleUserIdle(userId);
    });

    socket.on('heartbeat', (userId: string) => {
      this.connectionManager.handleHeartbeat(userId, socket.id);
    });

    socket.on('disconnect', (reason) => {
      const userId = this.socketMaps.userMap.get(socket.id);
      console.log(`🔌 Socket ${socket.id} disconnected. Reason: ${reason}. UserId: ${userId}`);
      
      if (userId) {
        this.connectionManager.handleDisconnectWithTimeout(userId, socket.id, reason);
      }
    });
  }
}