import { Message } from '@/server/models/Message'
import mongoose from 'mongoose' 

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { senderId, receiverId, page = 1, limit = 50 } = query

    if (!senderId || !receiverId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'senderId and receiverId are required'
      })
    }

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 50
    const skip = (pageNum - 1) * limitNum

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
    .limit(parseInt(String(limit)))

    return {
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        hasMore: messages.length === parseInt(String(limit))
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Internal Server Error'
    })
  }
})