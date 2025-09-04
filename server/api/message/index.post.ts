import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { senderId, receiverId, content, messageType = 'text', attachmentUrl, attachmentType, attachmentSize } = body

    if (!senderId || !receiverId || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'senderId, receiverId, and content are required'
      })
    }

    const messageData: any = {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type: messageType,
      status: 'sent'
    }

    if (attachmentUrl) {
      messageData.attachment_url = attachmentUrl
      messageData.attachment_type = attachmentType
      messageData.attachment_size = attachmentSize
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:users!sender_id(id, username, email, avatar_url),
        receiver:users!receiver_id(id, username, email, avatar_url)
      `)
      .single()

    if (error) {
      throw error
    }

    // Real-time updates are handled automatically by Supabase Realtime
    console.log('📨 Message sent via Supabase:', message)

    return {
      success: true,
      data: message
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    })
  }
})
