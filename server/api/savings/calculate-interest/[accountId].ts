import { SavingsAccount, SavingsTransaction, InterestCalculation } from '@/server/models/Saving'
import { getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const accountId = getRouterParam(event, 'accountId')
    if (!accountId) {
      throw createError({ statusCode: 400, statusMessage: 'accountId not provided' })
    }

    let account = await SavingsAccount.findById(accountId).populate('productId')
    if (!account) {
      throw createError({ statusCode: 404, statusMessage: 'Savings account not found' })
    }

    const now = new Date()
    const lastCalc = account.lastInterestCalculation || account.openDate || now
    const minutes = Math.floor((now.getTime() - lastCalc.getTime()) / (1000 * 60))

    console.log(`[CALC] Account ${accountId} - Current balance: ${account.balance}, Accrued interest: ${account.interestAccrued}`)
    console.log(`[CALC] Minutes since last calc: ${minutes}`)

    let newInterestAmount = 0

    // Hitung dan tambahkan interest baru jika sudah lewat 1 menit
    if (minutes >= 1) {
      const rate = account.productId?.interestRate
      if (!rate) {
        throw createError({ statusCode: 500, statusMessage: 'Interest rate not defined for product' })
      }

      newInterestAmount = account.calculateInterest(minutes)
      console.log(`[CALC] Calculated new interest: ${newInterestAmount}`)

      // Tambahkan interest baru ke akumulasi
      account.interestAccrued += newInterestAmount
      account.lastInterestCalculation = now
      
      // Simpan perubahan
      await account.save()

      // Simpan log perhitungan
      await new InterestCalculation({
        accountId: account._id,
        calculationDate: now,
        principalAmount: account.balance,
        interestRate: rate,
        daysCalculated: minutes,
        interestAmount: newInterestAmount,
        status: 'calculated'
      }).save()

      console.log(`[CALC] Updated accrued interest: ${account.interestAccrued}`)
    }

    // Cek apakah ada interest yang bisa diaplikasikan
    if (account.interestAccrued <= 0) {
      // Jika tidak ada interest, return success dengan pesan informatif
      return {
        success: true,
        message: 'No interest to apply at this time',
        data: {
          accountId: account._id,
          balanceBefore: account.balance,
          balanceAfter: account.balance,
          interestApplied: 0,
          minutesSinceLast: minutes,
          newInterestCalculated: newInterestAmount,
          reason: minutes < 1 ? 'Insufficient time passed' : 'No accrued interest available'
        }
      }
    }

    // Apply semua interest yang terakumulasi
    const balanceBefore = account.balance
    const finalInterest = account.interestAccrued
    
    account.balance += finalInterest
    account.interestAccrued = 0
    
    // Simpan perubahan balance
    await account.save()

    // Catat transaksi
    await new SavingsTransaction({
      accountId: account._id,
      type: 'interest',
      amount: finalInterest,
      balanceBefore,
      balanceAfter: account.balance,
      description: `Interest applied (${minutes} minutes accumulated)`
    }).save()

    // Update status log perhitungan
    await InterestCalculation.updateMany(
      { accountId: account._id, status: 'calculated' },
      { status: 'applied' }
    )

    console.log(`[SUCCESS] Interest applied: ${finalInterest}, New balance: ${account.balance}`)

    return {
      success: true,
      message: 'Interest calculated and applied successfully',
      data: {
        accountId: account._id,
        balanceBefore,
        balanceAfter: account.balance,
        interestApplied: finalInterest,
        minutesSinceLast: minutes,
        newInterestCalculated: newInterestAmount
      }
    }

  } catch (error: any) {
    console.error('[CALC ERROR]', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to calculate and apply interest'
    })
  }
})