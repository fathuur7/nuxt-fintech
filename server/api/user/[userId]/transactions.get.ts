import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const offset = (page - 1) * limit

    const { data: transactions, error: transactionsError, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transactionsError) {
      throw transactionsError
    }
    return {
      success: true,
      data: {
        transactions: transactions || [],
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
        total: count || 0
      }
    }

  } catch (error: any) {
    console.error('Error getting user transactions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})