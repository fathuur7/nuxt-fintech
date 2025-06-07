import { Server } from 'socket.io';
import type { UserStatusData, SocketMaps } from '../types/socket.types';

export class BroadcastService {
  constructor(
    private io: Server,
    private socketMaps: SocketMaps
  ) {}

  broadcastStatusUpdate(userId: string, status: 'online' | 'offline' | 'idle', userData: any): void {
    const timestamp = new Date().toISOString();
    
    const eventData: UserStatusData = {
      userId,
      status,
      isActive: status === 'online',
      timestamp,
      userName: userData.name
    };

    this.io.emit('status-update', eventData);
    this.io.emit('user-status-update', eventData);
    
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

  broadcastToUser(userId: string, event: string, data: any) {
    const socketId = this.socketMaps.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  broadcastToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.broadcastToUser(userId, event, data);
    });
  }

  broadcastNewMessage(senderId: string, receiverId: string, message: any) {
    this.broadcastToUser(senderId, 'send_message', message);
      
    const delivered = this.broadcastToUser(receiverId, 'message_received', message);
    
    if (delivered) {
      setTimeout(() => {
        this.broadcastToUser(senderId, 'message:status_updated', {
          messageId: message._id,
          status: 'delivered'
        });
      }, 100);
    }
  }

  broadcastTypingStatus(senderId: string, receiverId: string, isTyping: boolean) {
    this.broadcastToUser(receiverId, 'user:typing', {
      userId: senderId,
      isTyping
    });
  }

  broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    this.io.emit('user:status_changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  broadcastUnreadCount(userId: string, count: number) {
    this.broadcastToUser(userId, 'messages:unread_count', { count });
  }
}