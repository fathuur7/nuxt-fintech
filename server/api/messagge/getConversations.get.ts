
import mongoose from 'mongoose'
import { Message } from '../../models/Message'
import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const { userId } = query
    
    if (!userId) {
      return {
        success: false,
        error: 'userId parameter is required'
      }
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId))
    
    // Get last message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { userId: userObjectId },
            { toUserId: userObjectId }
          ],
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$userId', userObjectId] },
              then: '$toUserId',
              else: '$userId'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$toUserId', new mongoose.Types.ObjectId(String(userId))] },
                    { $ne: ['$status', 'read'] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ])
    
    return {
      success: true,
      data: conversations
    }
  } catch (error) {
    console.error('❌ Error fetching conversations:', error)
    return {
      success: false,
      error: 'Failed to fetch conversations'
    }
  }
})