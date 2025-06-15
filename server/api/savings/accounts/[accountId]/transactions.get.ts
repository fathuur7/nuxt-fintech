import { SavingsTransaction } from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const accountId = getRouterParam(event, 'accountId')
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    
    const transactions = await SavingsTransaction.find({ accountId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
    
    const total = await SavingsTransaction.countDocuments({ accountId })
    
    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})