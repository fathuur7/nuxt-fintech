import midtransClient from 'midtrans-client'
import { supabase } from '~/lib/supabase'

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
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .single()
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
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: transactionStatus,
            transaction_id: statusResponse.transaction_id,
            payment_type: statusResponse.payment_type
          })
          .eq('order_id', orderId)

        if (updateError) {
          console.error('Error updating transaction:', updateError)
        }
        // Update balance if successful
        if (transactionStatus === 'success') {
          const { error: balanceError } = await supabase
            .from('users')
            .update({
              balance: supabase.sql`balance + ${transaction.amount}`
            })
            .eq('id', transaction.user_id)
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