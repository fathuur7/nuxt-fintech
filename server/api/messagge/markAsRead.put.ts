
import { Message } from '../../models/Message'
import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const body = await readBody(event)
    const { messageIds, userId } = body
    
    if (!messageIds || !Array.isArray(messageIds) || !userId) {
      return {
        success: false,
        error: 'messageIds array and userId are required'
      }
    }
    
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        toUserId: userId,
        status: { $ne: 'read' }
      },
      {
        status: 'read'
      }
    )
    
    return {
      success: true,
      message: 'Messages marked as read'
    }
  } catch (error) {
    console.error('❌ Error marking messages as read:', error)
    return {
      success: false,
      error: 'Failed to mark messages as read'
    }
  }
})
