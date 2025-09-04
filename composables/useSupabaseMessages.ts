import type { Database } from '~/lib/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

export const useSupabaseMessages = () => {
  const { supabase } = useSupabase()
  const { getCurrentUserId } = useSupabaseAuth()
  
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (receiverId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    try {
      loading.value = true
      error.value = null
      
      const senderId = getCurrentUserId()
      if (!senderId) {
        throw new Error('User not authenticated')
      }

      const messageData: MessageInsert = {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        message_type: messageType
      }

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:users!sender_id(id, username, avatar_url),
          receiver:users!receiver_id(id, username, avatar_url)
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      return data
    } catch (err) {
      console.error('Error sending message:', err)
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      return null
    } finally {
      loading.value = false
    }
  }

  const getMessages = async (otherUserId: string, limit: number = 50) => {
    try {
      loading.value = true
      error.value = null
      
      const currentUserId = getCurrentUserId()
      if (!currentUserId) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, username, avatar_url),
          receiver:users!receiver_id(id, username, avatar_url)
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      messages.value = data || []
      return data
    } catch (err) {
      console.error('Error fetching messages:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
      return []
    } finally {
      loading.value = false
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', messageId)
        .eq('receiver_id', getCurrentUserId())
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data
    } catch (err) {
      console.error('Error marking message as read:', err)
      return null
    }
  }

  const getUnreadCount = async () => {
    try {
      const currentUserId = getCurrentUserId()
      if (!currentUserId) return 0

      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', currentUserId)
        .eq('is_read', false)

      if (countError) {
        throw countError
      }

      return count || 0
    } catch (err) {
      console.error('Error getting unread count:', err)
      return 0
    }
  }

  const getConversations = async () => {
    try {
      const currentUserId = getCurrentUserId()
      if (!currentUserId) return []

      // Get latest message for each conversation
      const { data, error: fetchError } = await supabase
        .rpc('get_user_conversations', { user_uuid: currentUserId })

      if (fetchError) {
        throw fetchError
      }

      return data || []
    } catch (err) {
      console.error('Error fetching conversations:', err)
      return []
    }
  }

  const subscribeToMessages = (otherUserId: string, callback: (message: Message) => void) => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return null

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()

    return channel
  }

  const subscribeToUserStatus = (callback: (user: any) => void) => {
    const channel = supabase
      .channel('user_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()

    return channel
  }

  return {
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    sendMessage,
    getMessages,
    markMessageAsRead,
    getUnreadCount,
    getConversations,
    subscribeToMessages,
    subscribeToUserStatus
  }
}