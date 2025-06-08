import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'expired'],
    default: 'pending'
  },
  transactionId: String,
  paymentType: String,
  snapToken: String,
  snapRedirectUrl: String
}, {
  timestamps: true
})

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)