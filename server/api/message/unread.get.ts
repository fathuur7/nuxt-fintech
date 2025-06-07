import { Message } from '@/server/models/Message'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId } = query

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      })
    }

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    })

    const unreadMessages = await Message.find({
      receiverId: userId,
      isRead: false
    })
    .populate('senderId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(20)

    return {
      success: true,
      data: {
        count: unreadCount,
        messages: unreadMessages
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Internal Server Error'
    })
  }
})