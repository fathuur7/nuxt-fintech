import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { senderId, receiverId, page = 1, limit = 50 } = query

    if (!senderId || !receiverId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'senderId and receiverId are required'
      })
    }

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 50
    const offset = (pageNum - 1) * limitNum

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, username, email, avatar_url),
        receiver:users!receiver_id(id, username, email, avatar_url)
      `)
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) {
      throw error
    }
    return {
      success: true,
      data: (messages || []).reverse(), // Reverse to show oldest first
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: (messages || []).length === limitNum
      }
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    })
  }
})