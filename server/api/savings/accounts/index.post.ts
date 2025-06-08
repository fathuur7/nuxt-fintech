// api/savings/accounts/index.post.ts
import { SavingsProduct , SavingsAccount, SavingsTransaction } from '@/server/models/Saving'
import { User } from '@/server/models/User'
import { generateAccountNumber } from '@/server/utils/generate'

export default defineEventHandler(async (event) => {
  try {
    const { userId, productId, initialDeposit = 0 } = await readBody(event)
    
    // Validasi user exists
    const user = await User.findById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Validasi product exists
    const product = await SavingsProduct.findById(productId)
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Savings product not found'
      })
    }
    
    // Validasi minimum balance
    if (initialDeposit < product.minBalance) {
      throw createError({
        statusCode: 400,
        statusMessage: `Minimum deposit is ${product.minBalance}`
      })
    }
    
    const accountNumber = generateAccountNumber()
    
    const account = new SavingsAccount({
      userId,
      productId,
      accountNumber,
      balance: initialDeposit,
      lastInterestCalculation: new Date()
    })
    
    await account.save()
    
    // Catat transaksi initial deposit jika ada
    if (initialDeposit > 0) {
      const transaction = new SavingsTransaction({
        accountId: account._id,
        type: 'deposit',
        amount: initialDeposit,
        balanceBefore: 0,
        balanceAfter: initialDeposit,
        description: 'Initial deposit'
      })
      await transaction.save()
    }
    
    await account.populate(['userId', 'productId'])
    
    return {
      success: true,
      message: 'Savings account created successfully',
      data: account
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})