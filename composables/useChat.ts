import type { Database } from '~/lib/supabase'
type Message = Database['public']['Tables']['messages']['Row']
interface ChatUser {
  id: string
  username?: string
  email?: string
}
export const useChat = (targetUserId: string) => {
  // State
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isConnected = ref(false)
  const currentUser = ref<ChatUser | null>(null)
  
  // Composables
  const { getCurrentUserId } = useSupabaseAuth()
  const { sendMessage: sendSupabaseMessage, getMessages, subscribeToMessages } = useSupabaseMessages()
  const { updatePresence } = useSupabaseRealtime()
  
  let messageSubscription: any = null
  
  // Computed
  const conversationId = computed(() => {
    if (!currentUser.value?.id || !targetUserId) return null
    const ids = [currentUser.value.id, targetUserId].sort()
    return `conversation_${ids[0]}_${ids[1]}`
  })
  
  // Initialize chat
  const initializeChat = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Get current user
      const userId = getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      currentUser.value = { id: userId }
      
      // Load existing messages
      await loadMessages()
      
      // Setup realtime subscription
      setupRealtimeSubscription()
      
      // Set user online
      await updatePresence('online')
      isConnected.value = true
      
    } catch (err) {
      console.error('Failed to initialize chat:', err)
      error.value = err instanceof Error ? err.message : 'Failed to initialize chat'
    } finally {
      loading.value = false
    }
  }
  
  // Load messages from Supabase
  const loadMessages = async () => {
    if (!currentUser.value?.id || !targetUserId) return
    
    try {
      const messageData = await getMessages(targetUserId)
      
      if (messageData) {
        messages.value = messageData
        console.log('📝 Messages loaded:', messageData.length)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      error.value = 'Failed to load messages'
    }
  }
  
  // Setup realtime subscription
  const setupRealtimeSubscription = () => {
    if (!currentUser.value?.id) return
    
    messageSubscription = subscribeToMessages(targetUserId, (message) => {
      console.log('📨 New message received via realtime:', message)
      
      // Add message to local state if not already present
      const existingMessage = messages.value.find(msg => msg.id === message.id)
      if (!existingMessage) {
        messages.value.push(message)
        messages.value.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        console.log('📝 Message added to conversation')
      }
    })
    
    console.log('🎧 Realtime subscription setup complete')
  }
  
  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentUser.value?.id || !targetUserId) {
      console.error('Invalid message data')
      return false
    }
    
    try {
      // Clear any previous errors
      error.value = null
      
      console.log('📤 Sending message:', {
        senderId: currentUser.value.id,
        receiverId: targetUserId,
        content: content.trim()
      })
      
      // Send via Supabase
      const message = await sendSupabaseMessage(targetUserId, content.trim())
      
      if (message) {
        console.log('📤 Message sent successfully:', message)
        return true
      } else {
        console.error('Failed to send message')
        return false
      }
      
    } catch (err) {
      console.error('Failed to send message:', err)
      error.value = 'Failed to send message'
      return false
    }
  }
  
  // Cleanup realtime subscription
  const cleanup = () => {
    if (!currentUser.value?.id) return
    
    console.log('🧹 Cleaning up chat connection')
    
    // Unsubscribe from realtime
    if (messageSubscription) {
      messageSubscription.unsubscribe()
      messageSubscription = null
    }
    
    // Set user offline
    updatePresence('offline').catch(console.error)
    
    isConnected.value = false
  }
  
  // Retry connection
  const retryConnection = () => {
    error.value = null
    cleanup()
    setTimeout(() => {
      initializeChat()
    }, 1000)
  }
  
  // Lifecycle management
  onMounted(() => {
    initializeChat()
  })
  
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    isConnected: readonly(isConnected),
    currentUser: readonly(currentUser),
    conversationId: readonly(conversationId),
    
    // Methods
    sendMessage,
    loadMessages,
    retryConnection,
    cleanup,
    initializeChat
  }
}