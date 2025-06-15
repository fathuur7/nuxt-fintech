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
    
    if (account.interestAccrued <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No accrued interest to apply'
      })
    }
    
    const balanceBefore = account.balance
    const interestAmount = account.interestAccrued
    
    account.balance += interestAmount
    account.interestAccrued = 0
    await account.save()
    
    // Catat transaksi bunga
    const transaction = new SavingsTransaction({
      accountId: account._id,
      type: 'interest',
      amount: interestAmount,
      balanceBefore,
      balanceAfter: account.balance,
      description: 'Interest payment'
    })
    await transaction.save()
    
    // Update status di interest calculation
    await InterestCalculation.updateMany(
      { accountId: account._id, status: 'calculated' },
      { status: 'applied' }
    )
    
    return {
      success: true,
      message: 'Interest applied successfully',
      data: {
        accountId: account._id,
        balanceBefore,
        balanceAfter: account.balance,
        interestApplied: interestAmount
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})