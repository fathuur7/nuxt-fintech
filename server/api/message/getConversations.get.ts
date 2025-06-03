import jwt from 'jsonwebtoken'
import {Message} from '@/server/models/Message'
import {User }from '@/server/models/User'

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

    // Get query parameters
    const query = getQuery(event)
    const { userId } = query

    // Verify current user matches userId
    if (currentUserId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized'
      })
    }

    // Get all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        }
      },
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ['$senderId', currentUserId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        $group: {
          _id: '$partnerId',
          lastMessage: { $last: '$content' },
          lastMessageDate: { $last: '$createdAt' },
          lastSenderId: { $last: '$senderId' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', currentUserId] },
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
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            picture: '$user.picture',
            status: '$user.status'
          },
          lastMessage: {
            content: '$lastMessage',
            createdAt: '$lastMessageDate',
            senderId: '$lastSenderId'
          },
          unreadCount: 1,
          updatedAt: '$lastMessageDate'
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ])

    return {
      success: true,
      data: conversations
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})