import jwt from 'jsonwebtoken'
import { Message } from '@/server/models/Message'

export default defineEventHandler(async (event) => {
  try {
    // Get auth token
    const token = getCookie(event, 'token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const currentUserId = decoded.userId || decoded.id

    // Get message ID from params
    const messageId = getRouterParam(event, 'id')

    if (!messageId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message ID is required'
      })
    }

    // Find message
    const message = await Message.findById(messageId)
    if (!message) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found'
      })
    }

    // Check if current user is the sender
    if (message.senderId.toString() !== currentUserId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only sender can delete message'
      })
    }

    // Delete message
    await Message.findByIdAndDelete(messageId)

    return {
      success: true,
      message: 'Message deleted successfully'
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})