import { SavingsAccount } from '@/server/models/Saving'
import { InterestCalculation } from '@/server/models/Saving'

export default defineEventHandler(async (event) => {
  try {
    const results: any[] = []
    
    const activeAccounts = await SavingsAccount.find({ 
      status: 'active',
      balance: { $gt: 0 }
    }).populate('productId')
    
    for (const account of activeAccounts) {
      const now = new Date()
      const lastCalculation = account.lastInterestCalculation
      
      // Hitung selisih dalam menit
      const minutesDiff = Math.floor((now.getTime() - lastCalculation.getTime()) / (1000 * 60))
      
      if (minutesDiff >= 1) {
        // Konversi suku bunga tahunan ke per menit untuk development
        // 1 tahun = 365 hari = 365 * 24 * 60 menit = 525,600 menit
        const minutelyRate = account.productId.interestRate / 525600 / 100
        const interestAmount = account.balance * minutelyRate * minutesDiff
        
        // Tambah ke akumulasi bunga
        account.interestAccrued += interestAmount
        account.lastInterestCalculation = now
        await account.save()
        
        // Log perhitungan
        const calculation = new InterestCalculation({
          accountId: account._id,
          calculationDate: now,
          principalAmount: account.balance,
          interestRate: account.productId.interestRate,
          daysCalculated: minutesDiff / (24 * 60), // konversi ke hari untuk log
          interestAmount,
          status: 'calculated'
        })
        await calculation.save()
        
        results.push({
          accountId: account._id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          minutesCalculated: minutesDiff,
          interestRate: account.productId.interestRate,
          interestAmount,
          totalInterestAccrued: account.interestAccrued
        })
      }
    }
    
    return {
      success: true,
      message: `Interest calculated for ${results.length} accounts`,
      data: results
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})