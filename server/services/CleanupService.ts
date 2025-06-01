import { UserStatusService } from './UserStatusService';
import { BroadcastService } from './BroadcastService';
import type { SocketMaps } from '../types/socket.types';
import { ConnectionManager } from './ConnectionManager';

export class CleanupService {
  constructor(
    private connectionManager: ConnectionManager,
    private broadcastService: BroadcastService,
    private socketMaps: SocketMaps
  ) {}

  startCleanupInterval(): void {
    setInterval(async () => {
      console.log('🧹 Running stale connection cleanup...');
      await this.cleanupStaleConnections();
    }, 2 * 60 * 1000); // Run every 2 minutes
  }

  private async cleanupStaleConnections(): Promise<void> {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    try {
      const staleUsers = await UserStatusService.findStaleUsers(staleThreshold);
      
      for (const user of staleUsers) {
        console.log(`🧹 Found stale user: ${user.name} (${user._id})`);
        
        const socketId = this.socketMaps.userSockets.get(user._id.toString());
        if (socketId) {
          await this.connectionManager.handleUserOffline(user._id.toString(), socketId, 'stale_cleanup');
        } else {
          // No socket found, just update database
          await UserStatusService.setUserOffline(user._id.toString());
          this.broadcastService.broadcastStatusUpdate(user._id.toString(), 'offline', user);
        }
      }
      
    } catch (error) {
      console.error('❌ Error during stale connection cleanup:', error);
    }
  }
}