import { SavingsAccount } from '@/server/models/Saving'
import { SavingsTransaction } from '@/server/models/Saving'
import { InterestCalculation } from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const accountId = getRouterParam(event, 'accountId')
   
    const account = await SavingsAccount.findById(accountId)
    if (!account) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Savings account not found'
      })
    }
   
    // Add logging to debug
    console.log(`Account ${accountId} - Current balance: ${account.balance}, Accrued interest: ${account.interestAccrued}`)
   
    if (account.interestAccrued <= 0) {
      // Check if there are pending interest calculations
      const pendingCalculations = await InterestCalculation.find({
        accountId: account._id,
        status: 'calculated'
      })
      
      throw createError({
        statusCode: 400,
        statusMessage: `No accrued interest to apply. Current accrued: ${account.interestAccrued}, Pending calculations: ${pendingCalculations.length}`
      })
    }
    
    // ... rest of your code
  } catch (error: any) {
    console.error('Apply interest error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message
    })
  }
})