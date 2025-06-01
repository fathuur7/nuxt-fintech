import { Server } from 'socket.io';
import type { UserStatusData } from '../types/socket.types';

export class BroadcastService {
  constructor(private io: Server) {}

  broadcastStatusUpdate(userId: string, status: 'online' | 'offline' | 'idle', userData: any): void {
    const timestamp = new Date().toISOString();
    
    const eventData: UserStatusData = {
      userId,
      status,
      isActive: status === 'online',
      timestamp,
      userName: userData.name
    };

    // Broadcast with different event names for different listeners
    this.io.emit('status-update', eventData);
    this.io.emit('user-status-update', eventData);
    
    // Specific status events
    if (status === 'online') {
      this.io.emit('user-online', eventData);
    } else if (status === 'offline') {
      this.io.emit('user-offline', eventData);
    } else if (status === 'idle') {
      this.io.emit('user-idle', eventData);
    }

    console.log(`📡 Broadcasted status update: ${userData.name} is ${status}`);
  }

  broadcastForceOffline(userId: string, userData: any): void {
    this.io.emit('user-forced-offline', {
      userId,
      status: 'offline',
      isActive: false,
      timestamp: new Date().toISOString(),
      userName: userData.name
    });
  }
}