import { Message } from '@/server/models/Message'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const messageId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      })
    }

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
    ).populate('senderId', 'name email avatar')
     .populate('receiverId', 'name email avatar')

    if (!message) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found or already read'
      })
    }

    // Emit real-time read receipt
    const io = event.context.io
    if (io) {
      io.to(`user_${message.senderId._id}`).emit('message_read', {
        messageId: message._id,
        readAt: message.readAt,
        readBy: userId
      })
    }

    return {
      success: true,
      data: message
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Internal Server Error'
    })
  }
})
