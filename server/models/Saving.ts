import type { ISavingsAccount } from '@/server/types/saving.types'
import mongoose from 'mongoose'
import { Document } from 'mongoose'

// Schema untuk produk tabungan
const savingsProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  interestRate: {
    type: Number,
    required: true, // dalam persen per tahun (misal: 5.5 untuk 5.5%)
  },
  minBalance: {
    type: Number,
    default: 0
  },
  maxBalance: {
    type: Number,
    default: null // null berarti unlimited
  },
  compoundPeriod: {
    type: String,
    enum: ['daily', 'monthly', 'quarterly', 'annually'],
    default: 'monthly'
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Schema untuk akun tabungan individual
const savingsAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsProduct',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  interestAccrued: {
    type: Number,
    default: 0 // bunga yang sudah terkumpul tapi belum dibayar
  },
  lastInterestCalculation: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'dormant', 'closed'],
    default: 'active'
  },
  openDate: {
    type: Date,
    default: Date.now
  },
  closeDate: Date
}, {
  timestamps: true
})

// Schema untuk transaksi tabungan
const savingsTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsAccount',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'interest', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: String,
  reference: String, // untuk referensi eksternal
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // admin yang memproses
  }
}, {
  timestamps: true
})

// Schema untuk log perhitungan bunga
const interestCalculationSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsAccount',
    required: true
  },
  calculationDate: {
    type: Date,
    required: true
  },
  principalAmount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  daysCalculated: {
    type: Number,
    required: true
  },
  interestAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['calculated', 'applied'],
    default: 'calculated'
  }
}, {
  timestamps: true
})

// Indexes untuk performa
savingsAccountSchema.index({ userId: 1 })
// savingsAccountSchema.index({ accountNumber: 1 })
savingsTransactionSchema.index({ accountId: 1, createdAt: -1 })
interestCalculationSchema.index({ accountId: 1, calculationDate: -1 })

// Methods untuk SavingsAccount
savingsAccountSchema.methods.calculateInterest = function(minutes = 1) {
  if (!this.productId || !this.productId.interestRate) {
    throw new Error('Product or interest rate not available')
  }
  
  // Convert minutes to daily equivalent for calculation
  // Assuming interest rate is annual percentage
  const annualRate = this.productId.interestRate / 100
  const minutesPerYear = 365 * 24 * 60 // 525,600 minutes per year
  const minuteRate = annualRate / minutesPerYear
  
  return this.balance * minuteRate * minutes
}

savingsAccountSchema.methods.addInterest = async function(interestAmount: number) {
  this.interestAccrued += interestAmount
  this.lastInterestCalculation = new Date()
  return await this.save()
}

savingsAccountSchema.methods.applyAccruedInterest = async function() {
  if (this.interestAccrued <= 0) {
    throw new Error(`No accrued interest to apply. Current: ${this.interestAccrued}`)
  }

  const balanceBefore = this.balance
  const interestToApply = this.interestAccrued
  
  // Apply interest to balance
  this.balance += interestToApply
  this.interestAccrued = 0
  
  // Save the account
  await this.save()
  
  // Create transaction record
  const SavingsTransaction = mongoose.model('SavingsTransaction')
  await new SavingsTransaction({
    accountId: this._id,
    type: 'interest',
    amount: interestToApply,
    balanceBefore,
    balanceAfter: this.balance,
    description: 'Interest payment applied'
  }).save()
  
  return {
    balanceBefore,
    balanceAfter: this.balance,
    interestApplied: interestToApply
  }
}

// Method to calculate and add interest in one go
savingsAccountSchema.methods.calculateAndAccrueInterest = async function(minutes = 1) {
  const interestAmount = this.calculateInterest(minutes)
  
  if (interestAmount > 0) {
    await this.addInterest(interestAmount)
    
    // Log the calculation
    const InterestCalculation = mongoose.model('InterestCalculation')
    await new InterestCalculation({
      accountId: this._id,
      calculationDate: new Date(),
      principalAmount: this.balance,
      interestRate: this.productId.interestRate,
      daysCalculated: minutes,
      interestAmount,
      status: 'calculated'
    }).save()
  }
  
  return interestAmount
}

// Export models
export const SavingsProduct = mongoose.models.SavingsProduct || 
  mongoose.model('SavingsProduct', savingsProductSchema)

export const SavingsAccount = mongoose.models.SavingsAccount || 
  mongoose.model('SavingsAccount', savingsAccountSchema)

export const SavingsTransaction = mongoose.models.SavingsTransaction || 
  mongoose.model('SavingsTransaction', savingsTransactionSchema)

export const InterestCalculation = mongoose.models.InterestCalculation || 
  mongoose.model('InterestCalculation', interestCalculationSchema)