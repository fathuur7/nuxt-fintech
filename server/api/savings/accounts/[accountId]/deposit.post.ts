import { SavingsAccount } from '@/server/models/Saving'
import { SavingsTransaction } from '@/server/models/Saving'
import { User } from '@/server/models/User'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const accountId = getRouterParam(event, 'accountId')
    const { amount, description = 'Deposit' } = await readBody(event)

    if (amount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be greater than 0'
      })
    }

    const account = await SavingsAccount.findById(accountId)
      .populate('productId')
      .session(session)

    if (!account) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Savings account not found'
      })
    }

    const user = await User.findById(account.userId).session(session)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Pastikan user punya cukup saldo untuk deposit
    if (user.balance < amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient user balance for deposit'
      })
    }

    const balanceBefore = account.balance
    const newBalance = account.balance + amount

    // Cek maksimum saldo tabungan
    if (account.productId.maxBalance && newBalance > account.productId.maxBalance) {
      throw createError({
        statusCode: 400,
        statusMessage: `Maximum balance exceeded. Max: ${account.productId.maxBalance}`
      })
    }

    // Update saldo tabungan
    account.balance = newBalance
    await account.save({ session })

    // Update saldo user
    user.balance -= amount
    await user.save({ session })

    // Catat transaksi
    const transaction = new SavingsTransaction({
      accountId: account._id,
      type: 'deposit',
      amount,
      balanceBefore,
      balanceAfter: account.balance,
      description
    })
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return {
      success: true,
      message: 'Deposit successful',
      data: {
        accountId: account._id,
        balanceBefore,
        balanceAfter: account.balance,
        depositAmount: amount,
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
