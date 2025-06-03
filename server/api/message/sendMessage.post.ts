import jwt from 'jsonwebtoken'
import { Message } from '@/server/models/Message'
import { User } from '@/server/models/User'

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
    const { senderId, toUserId, message, messageType = 'text' } = body

    console.log('Send message request:', { senderId, toUserId, message, messageType })

    // Verify current user matches senderId
    if (currentUserId !== senderId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized - user mismatch'
      })
    }

    // Validate required fields
    if (!toUserId || !message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'toUserId and message are required'
      })
    }

    // Check if recipient exists
    const recipient = await User.findById(toUserId)
    if (!recipient) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipient not found'
      })
    }

    // Create new message
    const newMessage = new Message({
      senderId: currentUserId, // Use currentUserId from token untuk konsistensi
      receiverId: toUserId,
      content: message,
      messageType,
      status: 'sent',
      isRead: false
    })

    await newMessage.save()

    // Populate sender and receiver info
    await newMessage.populate([
      { path: 'senderId', select: 'name email picture' },
      { path: 'receiverId', select: 'name email picture' }
    ])

    console.log('Message created successfully:', newMessage._id)

    return {
      success: true,
      data: newMessage
    }

  } catch (error: any) {
    console.error('Error in sendMessage API:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})