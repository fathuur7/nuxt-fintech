import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      data: adminUsers || []
    }
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
