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
      
      // Cancel offline timeout karena user reconnect
      this.clearDisconnectTimeout(userId);
      
      this.updateSocketMappings(userId, socketId);
      
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
    // Reasons yang akan langsung set offline (tanpa grace period)
    const immediateOfflineReasons = [
      'client namespace disconnect',  // manual disconnect/logout
      'beforeunload',                 // user menutup tab/browser
      'force_offline'                 // admin force offline
    ];

    // Reasons yang menandakan user berpindah tab (harus langsung offline)
    const tabChangeReasons = [
      'transport close',  // ketika tab tidak aktif atau berpindah tab
      'ping timeout'      // koneksi terputus karena tab tidak aktif
    ];

    if (immediateOfflineReasons.includes(reason)) {
      console.log(`🔴 User ${userId} going offline immediately - reason: ${reason}`);
      this.handleUserOffline(userId, socketId, reason);
    } else if (tabChangeReasons.includes(reason)) {
      // Untuk tab change, beri grace period lebih pendek (2 detik)
      // karena biasanya tab change tidak reconnect dengan cepat
      const timeoutId = setTimeout(async () => {
        const currentSocketId = this.socketMaps.userSockets.get(userId);
        
        if (currentSocketId === socketId) {
          console.log(`🔴 Tab change timeout for user ${userId}, setting offline`);
          await this.handleUserOffline(userId, socketId, 'tab_change_timeout');
        } else {
          console.log(`✅ User ${userId} reconnected from different tab before timeout`);
        }
      }, 2000); // 2 detik untuk tab change

      this.socketMaps.disconnectTimeouts.set(userId, timeoutId);
      console.log(`⏰ Set tab change timeout for user: ${userId}`);
    } else {
      // Untuk navigation dalam SPA (single page application), beri grace period lebih lama
      const timeoutId = setTimeout(async () => {
        const currentSocketId = this.socketMaps.userSockets.get(userId);
        
        if (currentSocketId === socketId) {
          console.log(`⏰ Navigation timeout for user ${userId}, setting offline`);
          await this.handleUserOffline(userId, socketId, 'navigation_timeout');
        } else {
          console.log(`✅ User ${userId} reconnected after navigation`);
        }
      }, 10000); // 10 detik untuk navigasi dalam aplikasi

      this.socketMaps.disconnectTimeouts.set(userId, timeoutId);
      console.log(`⏰ Set navigation timeout for user: ${userId} (reason: ${reason})`);
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
    if (existingSocketId && existingSocketId !== socketId) {
      this.socketMaps.userMap.delete(existingSocketId);
    }
    
    // Set new mappings
    this.socketMaps.userMap.set(socketId, userId);
    this.socketMaps.userSockets.set(userId, socketId);
  }

  private cleanupSocketMappings(userId: string, socketId: string): void {
    // Only cleanup if this socket is still mapped to this user
    const currentSocketId = this.socketMaps.userSockets.get(userId);
    if (currentSocketId === socketId) {
      this.socketMaps.userMap.delete(socketId);
      this.socketMaps.userSockets.delete(userId);
    }
  }
}