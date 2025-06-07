// composables/useChat.ts
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Message {
  _id: string
  senderId: string | { _id: string; name: string; email: string }
  receiverId: string | { _id: string; name: string; email: string }
  content: string
  createdAt?: string
  status?: 'sent' | 'delivered' | 'read'
  messageType?: string
  isRead?: boolean
}

interface ChatUser {
  id: string
  name?: string
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
  const { $socket } = useNuxtApp()
  const { fetchUserData, getUserId } = useProfile()
  
  // Helper function to extract ID from user object
  const extractUserId = (user: string | { _id: string }): string => {
    if (typeof user === 'string') return user
    return user._id
  }
  
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
      await fetchUserData()
      const userId = getUserId()
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      currentUser.value = { id: userId }
      
      // Load existing messages
      await loadMessages()
      
      // Setup socket connection
      if ($socket) {
        await setupSocketConnection(userId)
      }
      
    } catch (err) {
      console.error('Failed to initialize chat:', err)
      error.value = err instanceof Error ? err.message : 'Failed to initialize chat'
    } finally {
      loading.value = false
    }
  }
  
  // Load messages from API
  const loadMessages = async () => {
    if (!currentUser.value?.id || !targetUserId) return
    
    try {
      const response = await $fetch<{ data: Message[] }>('/api/message', {
        method: 'GET',
        params: {
          senderId: currentUser.value.id,
          receiverId: targetUserId
        }
      })
      
      console.log('📥 Messages loaded:', response)
      
      if (response && response.data) {
        // Normalize message format and sort by date
        const normalizedMessages = response.data.map(msg => ({
          ...msg,
          senderId: extractUserId(msg.senderId),
          receiverId: extractUserId(msg.receiverId)
        })).sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        )
        
        messages.value = normalizedMessages
        console.log('📝 Normalized messages:', normalizedMessages)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      error.value = 'Failed to load messages'
    }
  }
  
  // Setup socket connection
  const setupSocketConnection = async (userId: string) => {
    if (!$socket) {
      console.error('Socket not available')
      return
    }
    
    try {
      // Set user online
      const connected = await $socket.setUserOnline(userId)
      
      if (connected) {
        isConnected.value = true
        
        // Join conversation room
        const roomName = `chat_${[userId, targetUserId].sort().join('_')}`
        $socket.emit('join_conversation', {
          senderId: userId,
          receiverId: targetUserId,
          room: roomName
        })
        
        // Also join individual rooms
        $socket.emit('join_room', `user_${userId}`)
        $socket.emit('join_room', `user_${targetUserId}`)
        
        // Setup event listeners
        setupSocketListeners()
        
        console.log('✅ Chat socket connected, joined room:', roomName)
      } else {
        throw new Error('Failed to connect socket')
      }
    } catch (err) {
      console.error('Socket connection failed:', err)
      isConnected.value = false
      error.value = 'Connection failed'
    }
  }
  
  // Setup socket event listeners
  const setupSocketListeners = () => {
    if (!$socket) return
    
    // Clean up existing listeners first
    $socket.off('new_message')
    $socket.off('message_sent')
    $socket.off('message_error')
    $socket.off('conversation_joined')
    $socket.off('message_received')
    
    // Listen for new messages
    $socket.on('new_message', handleNewMessage)
    $socket.on('message_received', handleNewMessage) // Alternative event name
    $socket.on('message_sent', handleMessageSent)
    $socket.on('message_error', handleMessageError)
    $socket.on('conversation_joined', handleConversationJoined)
    
    console.log('🎧 Socket listeners setup complete')
  }
  
  // Socket event handlers
  const handleNewMessage = (data: any) => {
    console.log('📨 New message received:', data)
    
    try {
      let message = data.message || data
      
      // Normalize the message format
      const normalizedMessage = {
        ...message,
        senderId: extractUserId(message.senderId || message.userId),
        receiverId: extractUserId(message.receiverId || message.toUserId)
      }
      
      // Check if message belongs to current conversation
      const isForCurrentConversation = 
        (normalizedMessage.senderId === targetUserId && normalizedMessage.receiverId === currentUser.value?.id) ||
        (normalizedMessage.senderId === currentUser.value?.id && normalizedMessage.receiverId === targetUserId)
      
      if (isForCurrentConversation) {
        // Avoid duplicates
        const existingMessage = messages.value.find(msg => msg._id === normalizedMessage._id)
        if (!existingMessage) {
          messages.value.push(normalizedMessage)
          messages.value.sort((a, b) => 
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          )
          console.log('📝 Message added to conversation')
        } else {
          console.log('📝 Duplicate message ignored')
        }
      } else {
        console.log('📝 Message not for current conversation')
      }
    } catch (err) {
      console.error('Error handling new message:', err)
    }
  }
  
  const handleMessageSent = (data: any) => {
    console.log('✅ Message sent successfully:', data)
    // Update message status if needed
    if (data.messageId) {
      const messageIndex = messages.value.findIndex(msg => msg._id === data.messageId)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'sent'
      }
    }
  }
  
  const handleMessageError = (data: any) => {
    console.error('❌ Message error:', data)
    error.value = data.error || 'Failed to send message'
  }
  
  const handleConversationJoined = (data: any) => {
    console.log('👥 Joined conversation:', data)
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
      
      // Send via API first
      const response = await $fetch<{ success: boolean; data: Message }>('/api/message', {
        method: 'POST',
        body: {
          senderId: currentUser.value.id,
          receiverId: targetUserId,
          content: content.trim()
        }
      })
      
      console.log('📤 API response:', response)
      
      if (response?.success && response.data) {
        // Normalize the message format
        const normalizedMessage = {
          ...response.data,
          senderId: extractUserId(response.data.senderId),
          receiverId: extractUserId(response.data.receiverId)
        }
        
        // Add to local messages if not already present
        const existingMessage = messages.value.find(msg => msg._id === normalizedMessage._id)
        if (!existingMessage) {
          messages.value.push(normalizedMessage)
          messages.value.sort((a, b) => 
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          )
        }
        
        // Send via socket for real-time updates to other users
        if ($socket && isConnected.value) {
          const socketData = {
            senderId: currentUser.value.id,
            receiverId: targetUserId,
            content: content.trim(),
            message: normalizedMessage
          }
          
          $socket.emit('send_message', socketData)
          console.log('📡 Message sent via socket:', socketData)
        }
        
        return true
      } else {
        console.error('API response indicates failure')
        return false
      }
      
    } catch (err) {
      console.error('Failed to send message:', err)
      error.value = 'Failed to send message'
      return false
    }
  }
  
  // Cleanup socket connection
  const cleanup = () => {
    if (!$socket || !currentUser.value?.id) return
    
    console.log('🧹 Cleaning up chat connection')
    
    // Remove event listeners
    $socket.off('new_message', handleNewMessage)
    $socket.off('message_received', handleNewMessage)
    $socket.off('message_sent', handleMessageSent)
    $socket.off('message_error', handleMessageError)
    $socket.off('conversation_joined', handleConversationJoined)
    
    // Leave conversation room
    const roomName = `chat_${[currentUser.value.id, targetUserId].sort().join('_')}`
    $socket.emit('leave_conversation', {
      senderId: currentUser.value.id,
      receiverId: targetUserId,
      room: roomName
    })
    
    // Leave individual rooms
    $socket.emit('leave_room', `user_${currentUser.value.id}`)
    $socket.emit('leave_room', `user_${targetUserId}`)
    
    // Set user offline
    $socket.setUserOffline(currentUser.value.id)
    
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
  
  // Watch for socket connection changes
  watch(() => $socket?.isConnected?.(), (connected) => {
    if (connected !== undefined) {
      isConnected.value = connected
    }
  })
  
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