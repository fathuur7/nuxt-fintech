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

    // Get request body
    const body = await readBody(event)
    const { messageIds, userId } = body

    // Verify current user matches userId
    if (currentUserId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized'
      })
    }

    if (!messageIds || !Array.isArray(messageIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'messageIds array is required'
      })
    }

    // Update messages to read status
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiverId: userId // Only mark messages received by this user
      },
      {
        $set: {
          isRead: true,
          status: 'read',
          readAt: new Date()
        }
      }
    )

    return {
      success: true,
      message: 'Messages marked as read'
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
