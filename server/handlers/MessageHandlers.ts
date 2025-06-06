// handlers/MessageHandlers.ts
import { Socket } from 'socket.io';
import { Message } from '../models/Message';
import type { SocketMaps } from '../types/socket.types';
import { BroadcastService } from '../services/BroadcastService';
import { ConnectionManager } from '../services/ConnectionManager';

interface SendMessageData {
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentSize?: number;
  tempId?: string; // Optional temporary ID for optimistic updates
}

interface MessageReadData {
  messageId: string;
  userId: string;
}

interface TypingData {
  senderId: string;
  receiverId: string;
}

interface MessageDeliveredData {
  messageId: string;
  userId: string;
}

interface JoinConversationData {
  senderId: string;
  receiverId: string;
}

export class MessageHandlers {
  constructor(
    private connectionManager: ConnectionManager,
    private broadcastService: BroadcastService,
    private socketMaps: SocketMaps
  ) {}

  public registerMessageHandlers(socket: Socket): void {
    // Send message
    socket.on('send_message', async (data: SendMessageData) => {
      await this.handleSendMessage(socket, data);
    });

    // Mark message as delivered
    socket.on('message_delivered', async (data: MessageDeliveredData) => {
      await this.handleMessageDelivered(socket, data);
    });

    // Mark message as read
    socket.on('message_read', async (data: MessageReadData) => {
      await this.handleMessageRead(socket, data);
    });

    // Join conversation room
    socket.on('join_conversation', (data: JoinConversationData) => {
      this.handleJoinConversation(socket, data);
    });

    // Leave conversation room
    socket.on('leave_conversation', (data: JoinConversationData) => {
      this.handleLeaveConversation(socket, data);
    });

    // Typing indicators
    socket.on('typing_start', (data: TypingData) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data: TypingData) => {
      this.handleTypingStop(socket, data);
    });

    // Get message history
    socket.on('get_messages', async (data: { senderId: string; receiverId: string; page?: number; limit?: number }) => {
      await this.handleGetMessages(socket, data);
    });

    // Get conversations
    socket.on('get_conversations', async (data: { userId: string }) => {
      await this.handleGetConversations(socket, data);
    });

    // Get unread messages count
    socket.on('get_unread_count', async (data: { userId: string }) => {
      await this.handleGetUnreadCount(socket, data);
    });

    // Mark all messages as read in a conversation
    socket.on('mark_conversation_read', async (data: { senderId: string; receiverId: string }) => {
      await this.handleMarkConversationRead(socket, data);
    });

    // Delete message
    socket.on('delete_message', async (data: { messageId: string; userId: string }) => {
      await this.handleDeleteMessage(socket, data);
    });

    // Edit message
    socket.on('edit_message', async (data: { messageId: string; userId: string; newContent: string }) => {
      await this.handleEditMessage(socket, data);
    });
  }

  private async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void> {
    try {
      const { senderId, receiverId, content, messageType = 'text', attachmentUrl, attachmentType, attachmentSize } = data;

      // Validate required fields
      if (!senderId || !receiverId || !content) {
        socket.emit('message_error', {
          error: 'Missing required fields: senderId, receiverId, and content are required'
        });
        return;
      }

      // Create message data
      const messageData = {
        senderId,
        receiverId,
        content,
        messageType,
        status: 'sent',
        ...(attachmentUrl && {
          attachmentUrl,
          attachmentType,
          attachmentSize
        })
      };

      // Save message to database
      const message = new Message(messageData);
      await message.save();

      // Populate sender and receiver info
      await message.populate('senderId', 'name email avatar');
      await message.populate('receiverId', 'name email avatar');

      // Get conversation room name
      const conversationRoom = this.getConversationRoom(senderId, receiverId);

      // Emit to conversation room (both sender and receiver if they're in the room)
      socket.to(conversationRoom).emit('new_message', {
        message: message.toJSON(),
        conversationId: conversationRoom
      });

      // Emit to receiver's personal room for notifications
      const receiverSocketId = this.socketMaps.userSockets.get(receiverId);
      if (receiverSocketId) {
        socket.to(`user_${receiverId}`).emit('message_notification', {
          message: message.toJSON(),
          senderId,
          senderName: message.senderId.name
        });

        // Auto-mark as delivered if receiver is online
        setTimeout(async () => {
          await this.updateMessageStatus(message._id.toString(), 'delivered');
          
          // Notify sender about delivery
          socket.emit('message_status_update', {
            messageId: message._id,
            status: 'delivered',
            timestamp: new Date()
          });
        }, 100);
      }

      // Confirm message sent to sender
      socket.emit('message_sent', {
        message: message.toJSON(),
        tempId: data.tempId // If you're using temporary IDs for optimistic updates
      });

      console.log(`📨 Message sent from ${senderId} to ${receiverId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', {
        error: 'Failed to send message'
      });
    }
  }

  private async handleMessageDelivered(socket: Socket, data: MessageDeliveredData): Promise<void> {
    try {
      const { messageId, userId } = data;

      const message = await this.updateMessageStatus(messageId, 'delivered');
      
      if (message) {
        // Notify sender about delivery
        const senderSocketId = this.socketMaps.userSockets.get(message.senderId.toString());
        if (senderSocketId) {
          socket.to(`user_${message.senderId}`).emit('message_status_update', {
            messageId,
            status: 'delivered',
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  }

  private async handleMessageRead(socket: Socket, data: MessageReadData): Promise<void> {
    try {
      const { messageId, userId } = data;

      const message = await Message.findOneAndUpdate(
        { 
          _id: messageId, 
          receiverId: userId,
          isRead: false 
        },
        { 
          isRead: true, 
          status: 'read',
          readAt: new Date() 
        },
        { new: true }
      );

      if (message) {
        // Notify sender about read receipt
        const senderSocketId = this.socketMaps.userSockets.get(message.senderId.toString());
        if (senderSocketId) {
          socket.to(`user_${message.senderId}`).emit('message_status_update', {
            messageId,
            status: 'read',
            readAt: message.readAt,
            timestamp: new Date()
          });
        }

        socket.emit('message_read_success', { messageId });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  private handleJoinConversation(socket: Socket, data: JoinConversationData): void {
    const conversationRoom = this.getConversationRoom(data.senderId, data.receiverId);
    socket.join(conversationRoom);
    
    console.log(`👥 User ${socket.id} joined conversation: ${conversationRoom}`);
    
    socket.emit('conversation_joined', { 
      conversationId: conversationRoom,
      participants: [data.senderId, data.receiverId]
    });
  }

  private handleLeaveConversation(socket: Socket, data: JoinConversationData): void {
    const conversationRoom = this.getConversationRoom(data.senderId, data.receiverId);
    socket.leave(conversationRoom);
    
    console.log(`👋 User ${socket.id} left conversation: ${conversationRoom}`);
  }

  private handleTypingStart(socket: Socket, data: TypingData): void {
    const conversationRoom = this.getConversationRoom(data.senderId, data.receiverId);
    
    socket.to(conversationRoom).emit('user_typing', {
      userId: data.senderId,
      isTyping: true,
      conversationId: conversationRoom
    });

    // Also send to receiver's personal room
    socket.to(`user_${data.receiverId}`).emit('typing_notification', {
      userId: data.senderId,
      isTyping: true
    });
  }

  private handleTypingStop(socket: Socket, data: TypingData): void {
    const conversationRoom = this.getConversationRoom(data.senderId, data.receiverId);
    
    socket.to(conversationRoom).emit('user_typing', {
      userId: data.senderId,
      isTyping: false,
      conversationId: conversationRoom
    });

    // Also send to receiver's personal room
    socket.to(`user_${data.receiverId}`).emit('typing_notification', {
      userId: data.senderId,
      isTyping: false
    });
  }

  private async handleGetMessages(socket: Socket, data: { senderId: string; receiverId: string; page?: number; limit?: number }): Promise<void> {
    try {
      const { senderId, receiverId, page = 1, limit = 50 } = data;
      const skip = (page - 1) * limit;

      const messages = await Message.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      })
      .populate('senderId', 'name email avatar')
      .populate('receiverId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      socket.emit('messages_loaded', {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      socket.emit('messages_error', { error: 'Failed to load messages' });
    }
  }

  private async handleGetConversations(socket: Socket, data: { userId: string }): Promise<void> {
    try {
      const { userId } = data;

      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: userId },
              { receiverId: userId }
            ]
          }
        },
        {
          $addFields: {
            otherUserId: {
              $cond: {
                if: { $eq: ['$senderId', userId] },
                then: '$receiverId',
                else: '$senderId'
              }
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$otherUserId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiverId', userId] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'otherUser'
          }
        },
        {
          $unwind: '$otherUser'
        },
        {
          $sort: { 'lastMessage.createdAt': -1 }
        }
      ]);

      socket.emit('conversations_loaded', { conversations });
    } catch (error) {
      console.error('Error getting conversations:', error);
      socket.emit('conversations_error', { error: 'Failed to load conversations' });
    }
  }

  private async handleGetUnreadCount(socket: Socket, data: { userId: string }): Promise<void> {
    try {
      const { userId } = data;

      const unreadCount = await Message.countDocuments({
        receiverId: userId,
        isRead: false
      });

      socket.emit('unread_count_loaded', { count: unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      socket.emit('unread_count_error', { error: 'Failed to get unread count' });
    }
  }

  private async handleMarkConversationRead(socket: Socket, data: { senderId: string; receiverId: string }): Promise<void> {
    try {
      const { senderId, receiverId } = data;

      await Message.updateMany(
        {
          senderId: receiverId,
          receiverId: senderId,
          isRead: false
        },
        {
          isRead: true,
          status: 'read',
          readAt: new Date()
        }
      );

      // Notify sender about read receipts
      const senderSocketId = this.socketMaps.userSockets.get(receiverId);
      if (senderSocketId) {
        socket.to(`user_${receiverId}`).emit('conversation_read', {
          conversationWith: senderId,
          readAt: new Date()
        });
      }

      socket.emit('conversation_marked_read', { success: true });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      socket.emit('conversation_read_error', { error: 'Failed to mark conversation as read' });
    }
  }

  private async handleDeleteMessage(socket: Socket, data: { messageId: string; userId: string }): Promise<void> {
    try {
      const { messageId, userId } = data;

      const message = await Message.findOneAndDelete({
        _id: messageId,
        senderId: userId // Only sender can delete their messages
      });

      if (message) {
        const conversationRoom = this.getConversationRoom(
          message.senderId.toString(),
          message.receiverId.toString()
        );

        // Notify conversation participants
        socket.to(conversationRoom).emit('message_deleted', {
          messageId,
          deletedBy: userId
        });

        socket.emit('message_delete_success', { messageId });
      } else {
        socket.emit('message_delete_error', { error: 'Message not found or unauthorized' });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('message_delete_error', { error: 'Failed to delete message' });
    }
  }

  private async handleEditMessage(socket: Socket, data: { messageId: string; userId: string; newContent: string }): Promise<void> {
    try {
      const { messageId, userId, newContent } = data;

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          senderId: userId // Only sender can edit their messages
        },
        {
          content: newContent,
          editedAt: new Date()
        },
        { new: true }
      ).populate('senderId', 'name email avatar')
       .populate('receiverId', 'name email avatar');

      if (message) {
        const conversationRoom = this.getConversationRoom(
          message.senderId._id.toString(),
          message.receiverId._id.toString()
        );

        // Notify conversation participants
        socket.to(conversationRoom).emit('message_edited', {
          message: message.toJSON(),
          editedAt: message.editedAt
        });

        socket.emit('message_edit_success', { message: message.toJSON() });
      } else {
        socket.emit('message_edit_error', { error: 'Message not found or unauthorized' });
      }
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('message_edit_error', { error: 'Failed to edit message' });
    }
  }

  private getConversationRoom(userId1: string, userId2: string): string {
    // Create consistent room name regardless of order
    const sortedIds = [userId1, userId2].sort();
    return `conversation_${sortedIds[0]}_${sortedIds[1]}`;
  }

  private async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<any> {
    try {
      return await Message.findByIdAndUpdate(
        messageId,
        { status },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating message status:', error);
      return null;
    }
  }
}

