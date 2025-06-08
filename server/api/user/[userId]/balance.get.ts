import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Find user and get current balance
    const user = await User.findById(userId).select('balance name email')

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      message: 'User balance retrieved successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0
      }
    }

  } catch (error) {
    console.error('Error getting user balance:', error)
    
    if (typeof error === 'object' && error !== null && 'statusCode' in (error as any)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message || 'Internal server error'
        : 'Internal server error'
    })
  }
})