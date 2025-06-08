import midtransClient from 'midtrans-client'
import { User } from '@/server/models/User'
import { Transaction } from '@/server/models/Transaction'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { userId, amount, userEmail, userName } = body

    // Validation
    if (!userId || !amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and amount are required'
      })
    }

    if (amount < 10000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Minimum top-up amount is Rp 10.000'
      })
    }

    if (amount > 10000000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum top-up amount is Rp 10.000.000'
      })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Initialize Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: config.midtransServerKey,
      clientKey: config.midtransClientKey
    })

    // Generate unique order ID
    const orderId = `TOPUP-${userId}-${Date.now()}`

    // Midtrans parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: userName || user.fullName || user.name || 'Customer',
        email: userEmail || user.email,
        phone: user.phone || undefined
      },
      item_details: [{
        id: 'balance_topup',
        price: amount,
        quantity: 1,
        name: 'Top Up Saldo Digital Wallet',
        brand: 'Your App Name',
        category: 'Digital Wallet'
      }],
      callbacks: {
        finish: `${config.public.appDomain}/payment/success?order_id=${orderId}`
      }
    }
    console.log('Midtrans parameters:', parameter)

    // Create transaction in Midtrans
    const transaction = await snap.createTransaction(parameter)

    // Save transaction to database with pending status
    const newTransaction = new Transaction({
      userId,
      orderId,
      amount,
      status: 'pending',
      type: 'topup',
      snapToken: transaction.token,
      snapRedirectUrl: transaction.redirect_url,
      createdAt: new Date(),
      expiryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    })

    await newTransaction.save()

    return {
      success: true,
      message: 'Transaction created successfully',
      data: {
        orderId,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
        expiryTime: newTransaction.expiryTime
      }
    }

  } catch (error) {
    console.error('Error creating top-up transaction:', error)
    
    // Handle Midtrans specific errors
    if (typeof error === 'object' && error !== null && 'httpStatusCode' in error) {
      const err = error as { httpStatusCode: number; message?: string }
      throw createError({
        statusCode: err.httpStatusCode,
        statusMessage: `Midtrans Error: ${err.message}`
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : 'Internal server error'
    })
  }
})