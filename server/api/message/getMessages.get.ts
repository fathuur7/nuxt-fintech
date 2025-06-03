import jwt from 'jsonwebtoken'
import { Message } from '@/server/models/Message'
import { User } from '@/server/models/User'

export default defineEventHandler(async (event) => {
  console.log('getMessages API called')
  try {
    // Get auth token
    const token = getCookie(event, 'token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    console.log('Token received:', !!token)
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const currentUserId = decoded.userId || decoded.id

    // Get query parameters
    const query = getQuery(event)
    const { userA, userB, limit = 50, offset = 0 } = query
    console.log('Query params:', { userA, userB, limit, offset })
    
    if (!userA || !userB) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userA and userB are required'
      })
    }

    // Verify current user is part of the conversation
    if (currentUserId !== userA && currentUserId !== userB) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized to view this conversation'
      })
    }

    // Fetch messages between two users
    const messages = await Message.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA }
      ]
    })
    .populate('senderId', 'name email picture')
    .populate('receiverId', 'name email picture')
    .sort({ createdAt: -1 })
    .limit(parseInt((limit ?? 50).toString()))
    .skip(parseInt((offset ?? 0).toString()))
    
    // Reverse to get chronological order
    const sortedMessages = messages.reverse()

    return {
      success: true,
      data: sortedMessages,
      total: messages.length
    }

  } catch (error: any) {
    console.error('Error in getMessages API:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})