import midtransClient from 'midtrans-client'
import { Transaction } from '~/server/models/Transaction'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const orderId = getRouterParam(event, 'orderId')

    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    // Initialize Midtrans Core API
    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: config.midtransServerKey,
      clientKey: config.midtransClientKey
    })

    // Check status in Midtrans
    const statusResponse = await core.transaction.status(orderId)
    
    // Update status in database
    const transaction = await Transaction.findOne({ orderId })
    if (transaction) {
      let transactionStatus = 'pending'
      
      if (statusResponse.transaction_status === 'capture') {
        if (statusResponse.fraud_status === 'challenge') {
          transactionStatus = 'pending'
        } else if (statusResponse.fraud_status === 'accept') {
          transactionStatus = 'success'
        }
      } else if (statusResponse.transaction_status === 'settlement') {
        transactionStatus = 'success'
      } else if (statusResponse.transaction_status === 'cancel' || 
                 statusResponse.transaction_status === 'deny' || 
                 statusResponse.transaction_status === 'expire') {
        transactionStatus = 'failed'
      }

      if (transaction.status !== transactionStatus) {
        transaction.status = transactionStatus
        await transaction.save()

        // Update balance if successful
        if (transactionStatus === 'success') {
          await User.findByIdAndUpdate(
            transaction.userId,
            { $inc: { balance: transaction.amount } }
          )
        }
      }
    }

    return {
      success: true,
      data: {
        orderId,
        status: statusResponse.transaction_status,
        amount: statusResponse.gross_amount,
        paymentType: statusResponse.payment_type
      }
    }

  } catch (error: any) {
    console.error('Error checking transaction status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})