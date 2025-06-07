import { Message } from '@/server/models/Message'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId } = query

    if (!userId || typeof userId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required and must be a string'
      })
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ]
        },
        $addFields: {
          otherUserId: {
            $cond: {
              if: { $eq: ['$senderId', userObjectId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 },
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userObjectId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
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
    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'An unknown error occurred'
    })
  }
})