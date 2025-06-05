import { Socket } from 'socket.io';
import { MessageService } from '../services/MessageService';
import { BroadcastService } from '../services/BroadcastService';
import type { SocketMaps, MessageData, MessageStatusUpdate, TypingData } from '../types/socket.types';

export class MessageHandlers {
  constructor(
    private broadcastService: BroadcastService,
    private socketMaps: SocketMaps
  ) {}

  registerMessageHandlers(socket: Socket) {
    // Send new message
    socket.on('message:send', async (data: MessageData) => {
      try {
        const userId = this.socketMaps.userMap.get(socket.id);
        if (!userId) return;

        // Ensure senderId matches authenticated user
        data.senderId = userId;

        // Create message in database
        const message = await MessageService.createMessage(data);

        // Broadcast to both users
        this.broadcastService.broadcastNewMessage(
          data.senderId,
          data.receiverId,
          message
        );

        // Mark messages from receiver as delivered if sender is online
        await MessageService.markMessagesAsDelivered(data.receiverId, data.senderId);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', {
          error: 'Failed to send message',
          originalData: data
        });
      }
    });

    // Update message status (delivered/read)
    socket.on('message:update_status', async (data: MessageStatusUpdate) => {
      try {
        const userId = this.socketMaps.userMap.get(socket.id);
        if (!userId || userId !== data.userId) return;

        const updatedMessage = await MessageService.updateMessageStatus(
          data.messageId,
          data.status,
          userId
        );

        if (updatedMessage) {
          // Notify sender about status update
          this.broadcastService.broadcastToUser(
            updatedMessage.senderId.toString(),
            'message:status_updated',
            {
              messageId: data.messageId,
              status: data.status,
              readAt: updatedMessage.readAt
            }
          );

          // Update unread count for receiver
          if (data.status === 'read') {
            const unreadCount = await MessageService.getUnreadCount(userId);
            this.broadcastService.broadcastUnreadCount(userId, unreadCount);
          }
        }
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    });

    // Mark all messages as read in a conversation
    socket.on('message:mark_conversation_read', async (data: { otherUserId: string }) => {
      try {
        const userId = this.socketMaps.userMap.get(socket.id);
        if (!userId) return;

        // Update all unread messages from the other user
        await MessageService.updateManyMessagesStatus(data.otherUserId, userId);

        // Get updated unread count
        const unreadCount = await MessageService.getUnreadCount(userId);
        this.broadcastService.broadcastUnreadCount(userId, unreadCount);

        // Notify other user about read status
        this.broadcastService.broadcastToUser(data.otherUserId, 'messages:conversation_read', {
          userId: userId
        });

      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('user:typing', (data: TypingData) => {
      const userId = this.socketMaps.userMap.get(socket.id);
      if (!userId || userId !== data.senderId) return;

      this.broadcastService.broadcastTypingStatus(
        data.senderId,
        data.receiverId,
        data.isTyping
      );
    });

    // Get chat history
    socket.on('message:get_history', async (data: { otherUserId: string, page?: number, limit?: number }) => {
      try {
        const userId = this.socketMaps.userMap.get(socket.id);
        if (!userId) return;

        const messages = await MessageService.getChatMessages(
          userId,
          data.otherUserId,
          data.page,
          data.limit
        );

        socket.emit('message:history', {
          messages,
          otherUserId: data.otherUserId,
          page: data.page || 1
        });

      } catch (error) {
        console.error('Error getting message history:', error);
        socket.emit('message:error', {
          error: 'Failed to get message history'
        });
      }
    });

    // Get unread count
    socket.on('message:get_unread_count', async () => {
      try {
        const userId = this.socketMaps.userMap.get(socket.id);
        if (!userId) return;

        const count = await MessageService.getUnreadCount(userId);
        socket.emit('messages:unread_count', { count });

      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    });
  }
}