// Method: GET api/user/:userId/transactions
import { Transaction } from '~/server/models/Transaction'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec()

    const total = await Transaction.countDocuments({ userId })

    return {
      success: true,
      data: {
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    }

  } catch (error: any) {
    console.error('Error getting user transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})