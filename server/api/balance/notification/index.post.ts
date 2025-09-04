import crypto from 'crypto'
import { supabase } from '~/lib/supabase'

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
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single()
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
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: transactionStatus,
        transaction_id: notification.transaction_id,
        payment_type: notification.payment_type
      })
      .eq('order_id', orderId)

    if (updateError) {
      throw updateError
    }
    // If transaction successful, update user balance
    if (transactionStatus === 'success') {
      const { error: balanceError } = await supabase
        .from('users')
        .update({
          balance: supabase.sql`balance + ${transaction.amount}`
        })
        .eq('id', transaction.user_id)
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