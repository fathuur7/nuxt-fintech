import { SavingsAccount } from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const accountId = getRouterParam(event, 'accountId')
    
    const account = await SavingsAccount.findById(accountId)
      .populate(['userId', 'productId'])
    
    if (!account) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Savings account not found'
      })
    }
    
    // Hitung potential interest sampai sekarang
    const now = new Date()
    const lastCalculation = account.lastInterestCalculation
    const minutesDiff = Math.floor((now.getTime() - lastCalculation.getTime()) / (1000 * 60))
    
    let potentialInterest = 0
    if (minutesDiff >= 1) {
      const minutelyRate = account.productId.interestRate / 525600 / 100
      potentialInterest = account.balance * minutelyRate * minutesDiff
    }
    
    return {
      success: true,
      data: {
        ...account.toObject(),
        potentialInterest,
        minutesSinceLastCalculation: minutesDiff,
        totalAccruedInterest: account.interestAccrued + potentialInterest
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})
