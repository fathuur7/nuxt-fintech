import { SavingsAccount } from '@/server/models/Saving'
import { SavingsTransaction } from '@/server/models/Saving'
import { User } from '@/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const accountId = getRouterParam(event, 'accountId')
    const { amount, description = 'Withdrawal' } = await readBody(event)

    if (amount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Amount must be greater than 0' })
    }

    const account = await SavingsAccount.findById(accountId)
      .populate('productId')
      .session(session)

    if (!account) {
      throw createError({ statusCode: 404, statusMessage: 'Savings account not found' })
    }

    const balanceBefore = account.balance

    if (account.balance < amount) {
      throw createError({ statusCode: 400, statusMessage: 'Insufficient balance' })
    }

    const newBalance = account.balance - amount
    if (newBalance < account.productId.minBalance) {
      throw createError({
        statusCode: 400,
        statusMessage: `Minimum balance required: ${account.productId.minBalance}`
      })
    }

    // Update saldo akun tabungan
    account.balance = newBalance
    await account.save({ session })

    // Update saldo user (tambahkan karena user menerima uang dari penarikan)
    const user = await User.findById(account.userId).session(session)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    user.balance += amount
    await user.save({ session })

    // Catat transaksi
    const transaction = new SavingsTransaction({
      accountId: account._id,
      type: 'withdrawal',
      amount,
      balanceBefore,
      balanceAfter: newBalance,
      description
    })
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return {
      success: true,
      message: 'Withdrawal successful',
      data: {
        accountId: account._id,
        balanceBefore,
        balanceAfter: newBalance,
        withdrawalAmount: amount,
        userBalanceAfter: user.balance
      }
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
