// api/savings/accounts/index.post.ts
import { SavingsProduct , SavingsAccount, SavingsTransaction } from '@/server/models/Saving'
import { User } from '@/server/models/User'
import { generateAccountNumber } from '@/server/utils/generate'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { userId, productId, initialDeposit = 0 } = await readBody(event)

    // Validasi user
    const user = await User.findById(userId).session(session)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Validasi produk
    const product = await SavingsProduct.findById(productId).session(session)
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Savings product not found' })
    }

    // Validasi minimum deposit
    if (initialDeposit < product.minBalance) {
      throw createError({ statusCode: 400, statusMessage: `Minimum deposit is ${product.minBalance}` })
    }

    // Validasi saldo user cukup
    if (user.balance < initialDeposit) {
      throw createError({ statusCode: 400, statusMessage: 'Insufficient user balance for initial deposit' })
    }

    const accountNumber = generateAccountNumber()

    // Buat akun tabungan
    const account = new SavingsAccount({
      userId,
      productId,
      accountNumber,
      balance: initialDeposit,
      lastInterestCalculation: new Date()
    })
    await account.save({ session })

    // Kurangi saldo user
    user.balance -= initialDeposit
    await user.save({ session })

    // Catat transaksi deposit awal
    const transaction = new SavingsTransaction({
      accountId: account._id,
      type: 'deposit',
      amount: initialDeposit,
      balanceBefore: 0,
      balanceAfter: initialDeposit,
      description: 'Initial deposit'
    })
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    await account.populate(['userId', 'productId'])

    return {
      success: true,
      message: 'Savings account created successfully',
      data: account
    }
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
