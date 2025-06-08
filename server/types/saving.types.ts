import mongoose, { Document } from 'mongoose';

export interface ISavingsAccount extends Document {
    userId: mongoose.Types.ObjectId
    productId: mongoose.Types.ObjectId
    accountNumber: string
    balance: number
    interestAccrued: number
    lastInterestCalculation: Date
    status: 'active' | 'dormant' | 'closed'
    openDate: Date
    closeDate?: Date
    calculateInterest: (days?: number) => number
    addInterest: (interestAmount: number) => Promise<ISavingsAccount>
    applyInterest: () => Promise<ISavingsAccount | undefined>
}