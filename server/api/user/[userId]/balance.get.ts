import { supabase } from '~/lib/supabase'

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
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, balance')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      message: 'User balance retrieved successfully',
      data: {
        userId: user.id,
        name: user.username,
        email: user.email,
        balance: user.balance || 0
      }
    }

  } catch (error) {
    console.error('Error getting user balance:', error)
    
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})