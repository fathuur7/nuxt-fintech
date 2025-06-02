
import { Message } from '../../models/Message'
import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    const { userId, toUserId, message, messageType = 'text' } = body
    
    if (!userId || !toUserId || !message) {
      return {
        success: false,
        error: 'userId, toUserId, and message are required'
      }
    }
    
    const newMessage = new Message({
      userId,
      toUserId,
      message,
      messageType,
      status: 'sent'
    })
    
    await newMessage.save()
    
    // Populate user data
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('userId', 'name email picture')
      .populate('toUserId', 'name email picture')
    
    return {
      success: true,
      data: populatedMessage
    }
  } catch (error) {
    console.error('❌ Error sending message:', error)
    return {
      success: false,
      error: 'Failed to send message'
    }
  }
})
