import crypto from 'crypto'
import { Transaction } from '~/server/models/Transaction'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const notification = await readBody(event)

    // Verify signature
    const serverKey = config.midtransServerKey
    const orderId = notification.order_id
    const statusCode = notification.status_code
    const grossAmount = notification.gross_amount
    
    const signatureKey = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex')

    if (signatureKey !== notification.signature_key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      })
    }

    // Find transaction in database
    const transaction = await Transaction.findOne({ orderId })
    if (!transaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      })
    }

    // Update transaction status based on notification
    let transactionStatus = 'pending'
    
    if (notification.transaction_status === 'capture') {
      if (notification.fraud_status === 'challenge') {
        transactionStatus = 'pending'
      } else if (notification.fraud_status === 'accept') {
        transactionStatus = 'success'
      }
    } else if (notification.transaction_status === 'settlement') {
      transactionStatus = 'success'
    } else if (notification.transaction_status === 'cancel' || 
               notification.transaction_status === 'deny' || 
               notification.transaction_status === 'expire') {
      transactionStatus = 'failed'
    } else if (notification.transaction_status === 'pending') {
      transactionStatus = 'pending'
    }

    // Update transaction
    transaction.status = transactionStatus
    transaction.transactionId = notification.transaction_id
    transaction.paymentType = notification.payment_type
    await transaction.save()

    // If transaction successful, update user balance
    if (transactionStatus === 'success') {
      await User.findByIdAndUpdate(
        transaction.userId,
        { $inc: { balance: transaction.amount } }
      )
    }

    return {
      success: true,
      message: 'Notification processed successfully'
    }

  } catch (error: any) {
    console.error('Error handling Midtrans notification:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})