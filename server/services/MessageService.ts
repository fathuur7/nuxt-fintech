import { Message } from '../models/Message';
import type { MessageData } from '../types/socket.types';

export class MessageService {
  static async createMessage(messageData: MessageData) {
    try {
      const message = new Message({
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        attachmentUrl: messageData.attachmentUrl,
        attachmentType: messageData.attachmentType,
        attachmentSize: messageData.attachmentSize,
        status: 'sent'
      });

      const savedMessage = await message.save();
      await savedMessage.populate(['senderId', 'receiverId']);
      return savedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async updateMessageStatus(messageId: string, status: 'delivered' | 'read', userId: string) {
    try {
      const updateData: any = { status };
      
      if (status === 'read') {
        updateData.isRead = true;
        updateData.readAt = new Date();
      }

      const message = await Message.findOneAndUpdate(
        { 
          _id: messageId, 
          receiverId: userId 
        },
        updateData,
        { new: true }
      ).populate(['senderId', 'receiverId']);

      return message;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  // FIXED: Added missing method that was called in MessageHandlers
  static async updateManyMessagesStatus(senderId: string, receiverId: string) {
    try {
      await Message.updateMany(
        {
          senderId: senderId,
          receiverId: receiverId,
          isRead: false
        },
        {
          isRead: true,
          status: 'read',
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error updating many messages status:', error);
      throw error;
    }
  }

  static async markMessagesAsDelivered(senderId: string, receiverId: string) {
    try {
      await Message.updateMany(
        {
          senderId: senderId,
          receiverId: receiverId,
          status: 'sent'
        },
        {
          status: 'delivered'
        }
      );
    } catch (error) {
      console.error('Error marking messages as delivered:', error);
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await Message.countDocuments({
        receiverId: userId,
        isRead: false
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async getChatMessages(userId: string, otherUserId: string, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      })
      .populate(['senderId', 'receiverId'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      return messages.reverse();
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }
}