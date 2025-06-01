import type { SocketMaps } from '../types/socket.types';
import { UserStatusService } from './UserStatusService';
import { BroadcastService } from './BroadcastService';

export class ConnectionManager {
  constructor(
    private socketMaps: SocketMaps,
    private broadcastService: BroadcastService
  ) {}

  async handleUserActive(userId: string, socketId: string): Promise<void> {
    try {
      console.log(`🔄 Processing user-active for: ${userId}`);
      
      // Clear any pending disconnect timeout
      this.clearDisconnectTimeout(userId);
      
      // Update socket mappings
      this.updateSocketMappings(userId, socketId);
      
      // Update user status in database
      const updatedUser = await UserStatusService.setUserOnline(userId);
      
      if (updatedUser) {
        this.broadcastService.broadcastStatusUpdate(userId, 'online', updatedUser);
        console.log(`✅ User ${updatedUser.name} (${userId}) is now active`);
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
    }
  }

  async handleUserOffline(userId: string, socketId: string, reason: string): Promise<void> {
    try {
      console.log(`🔄 Processing disconnect for: ${userId} (${reason})`);
      
      // Clear any pending timeout
      this.clearDisconnectTimeout(userId);
      
      // Update user status in database
      const updatedUser = await UserStatusService.setUserOffline(userId);
      
      if (updatedUser) {
        this.broadcastService.broadcastStatusUpdate(userId, 'offline', updatedUser);
        console.log(`❌ User ${updatedUser.name} (${userId}) is now offline`);
      }
      
      // Clean up mappings
      this.cleanupSocketMappings(userId, socketId);
      
    } catch (error) {
      console.error('❌ Error setting user offline:', error);
    }
  }

  async handleUserIdle(userId: string): Promise<void> {
    try {
      console.log(`🟡 User ${userId} going idle`);
      
      const updatedUser = await UserStatusService.setUserIdle(userId);
      
      if (updatedUser) {
        this.broadcastService.broadcastStatusUpdate(userId, 'idle', updatedUser);
        console.log(`🟡 User ${updatedUser.name} (${userId}) is now idle`);
      }
    } catch (error) {
      console.error('❌ Error setting user idle:', error);
    }
  }

  async handleHeartbeat(userId: string, socketId: string): Promise<void> {
    if (this.socketMaps.userMap.get(socketId) === userId) {
      try {
        await UserStatusService.updateHeartbeat(userId);
      } catch (error) {
        console.error('Error updating heartbeat:', error);
      }
    }
  }

  handleDisconnectWithTimeout(userId: string, socketId: string, reason: string): void {
    // For certain disconnect reasons, set offline immediately
    if (reason === 'client namespace disconnect' || reason === 'transport close') {
      console.log(`🔴 User ${userId} manually set offline`);
      this.handleUserOffline(userId, socketId, 'manual');
    } else {
      // For other reasons, use timeout to handle brief disconnections
      const timeoutId = setTimeout(async () => {
        console.log(`⏰ Timeout reached for user ${userId}, setting offline`);
        await this.handleUserOffline(userId, socketId, 'timeout');
      }, 5000); // 5 second grace period
      
      this.socketMaps.disconnectTimeouts.set(userId, timeoutId);
      console.log(`⏰ Set disconnect timeout for user: ${userId}`);
    }
  }

  private clearDisconnectTimeout(userId: string): void {
    if (this.socketMaps.disconnectTimeouts.has(userId)) {
      clearTimeout(this.socketMaps.disconnectTimeouts.get(userId)!);
      this.socketMaps.disconnectTimeouts.delete(userId);
      console.log(`⏰ Cleared disconnect timeout for user: ${userId}`);
    }
  }

  private updateSocketMappings(userId: string, socketId: string): void {
    // Remove any existing mapping for this user (handle reconnection)
    const existingSocketId = this.socketMaps.userSockets.get(userId);
    if (existingSocketId) {
      this.socketMaps.userMap.delete(existingSocketId);
    }
    
    // Set new mappings
    this.socketMaps.userMap.set(socketId, userId);
    this.socketMaps.userSockets.set(userId, socketId);
  }

  private cleanupSocketMappings(userId: string, socketId: string): void {
    this.socketMaps.userMap.delete(socketId);
    this.socketMaps.userSockets.delete(userId);
  }
}
