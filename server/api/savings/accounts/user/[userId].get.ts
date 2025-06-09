import { SavingsAccount } from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    
    const accounts = await SavingsAccount.find({ 
      userId, 
      status: { $ne: 'closed' } 
    }).populate(['productId'])
    
    return {
      success: true,
      data: accounts
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})