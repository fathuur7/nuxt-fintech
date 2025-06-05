import { ref, onMounted, onUnmounted } from "vue"

interface Message {
  _id: string
  userId: { _id: string; name: string }
  toUserId: { _id: string; name: string }
  message: string
  messageType: 'text' | 'image' | 'file'
  status: 'sent' | 'delivered' | 'read'
  createdAt: string
  updatedAt: string
}

interface Conversation {
  user: { _id: string; name: string; picture?: string }
  unreadCount: number
  lastMessage?: Message
  updatedAt: string
}

interface TypingData {
  userId: string
  toUserId: string
  isTyping: boolean
  userName?: string
}

interface MessageStatusData {
  messageId: string
  status: 'sent' | 'delivered' | 'read'
  userId: string
}

export const useChat = () => {
  const messages = ref<Message[]>([])
  const conversations = ref<Conversation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)
  const selectedUserId = ref<string | null>(null)
  const socketConnected = ref(false)
  const typingUsers = ref<Set<string>>(new Set())
  const isTyping = ref(false)
  
  // Socket instance
  const { $socket } = useNuxtApp()
  let socket: any = null
  let typingTimeout: NodeJS.Timeout | null = null
  let socketListenersRegistered = false

  // Fetch messages between two users
  const fetchMessages = async (userA: string, userB: string, limit = 50) => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await $fetch<{ data: any; success: boolean; error?: string }>('/api/message/getMessages', {
        query: { userA, userB, limit }
      })
      
      if (data.success) {
        messages.value = data.data
        console.log('📬 Messages loaded:', messages.value.length)
      } else {
        throw new Error(data.error || 'Failed to fetch messages')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('❌ Error fetching messages:', err)
    } finally {
      loading.value = false
    }
  }

  // Send a message (with real-time socket emit)
  const sendMessage = async (userId: string, toUserId: string, message: string, messageType = 'text') => {
    try {
      const { data } = await $fetch<{ data: any; success: boolean; error?: string }>('/api/message/sendMessage', {
        method: 'POST',
        body: {
          userId,
          toUserId,
          message,
          messageType
        }
      })
      
      if (data.success) {
        const newMessage = data.data
        
        // Add new message to current messages if it's for the current conversation
        if ((userId === currentUserId.value && toUserId === selectedUserId.value) ||
            (userId === selectedUserId.value && toUserId === currentUserId.value)) {
          messages.value.push(newMessage)
        }
        
        // Emit socket event for real-time delivery
        if (socket && socket.connected) {
          socket.emit('send-message', {
            message: newMessage,
            toUserId,
            fromUserId: userId
          })
          console.log('📤 Message sent via socket:', newMessage._id)
        }
        
        // Update conversations list
        await updateConversationsList(userId, toUserId, newMessage)
        
        return newMessage
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('❌ Error sending message:', err)
      throw err
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[], userId: string) => {
    try {
      await $fetch('/api/message/markAsRead', {
        method: 'PUT',
        body: {
          messageIds,
          userId
        }
      })
      
      // Update local messages status
      messages.value.forEach(msg => {
        if (messageIds.includes(msg._id) && msg.toUserId._id === userId) {
          msg.status = 'read'
        }
      })
      
      // Emit socket event for real-time read status
      if (socket && socket.connected) {
        socket.emit('messages-read', {
          messageIds,
          userId,
          readBy: userId
        })
        console.log('👁️ Messages marked as read via socket:', messageIds.length)
      }
      
    } catch (err) {
      console.error('❌ Error marking messages as read:', err)
    }
  }

  // Fetch conversations list
  const fetchConversations = async (userId: string) => {
    try {
      const { data } = await $fetch<{ data: any; success: boolean; error?: string }>('/api/message/getConversations', {
        query: { userId }
      })
      
      if (data.success) {
        conversations.value = data.data
        console.log('💬 Conversations loaded:', conversations.value.length)
      } else {
        throw new Error(data.error || 'Failed to fetch conversations')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('❌ Error fetching conversations:', err)
    }
  }

  // Update conversations list when new message arrives
  const updateConversationsList = async (userId: string, toUserId: string, message: Message) => {
    const existingConvIndex = conversations.value.findIndex(conv => 
      conv.user._id === (userId === currentUserId.value ? toUserId : userId)
    )
    
    if (existingConvIndex !== -1) {
      const conv = conversations.value[existingConvIndex]
      conv.lastMessage = message
      conv.updatedAt = message.createdAt
      
      // Update unread count if message is for current user
      if (message.toUserId._id === currentUserId.value && message.userId._id !== currentUserId.value) {
        conv.unreadCount += 1
      }
      
      // Move conversation to top
      conversations.value.splice(existingConvIndex, 1)
      conversations.value.unshift(conv)
    } else {
      // Refresh conversations if new conversation
      if (currentUserId.value) {
        await fetchConversations(currentUserId.value)
      }
    }
  }

  // Typing indicators
  const startTyping = (toUserId: string) => {
    if (socket && socket.connected && currentUserId.value) {
      socket.emit('typing-start', {
        fromUserId: currentUserId.value,
        toUserId: toUserId
      })
      isTyping.value = true
      console.log('⌨️ Started typing to:', toUserId)
    }
  }

  const stopTyping = (toUserId: string) => {
    if (socket && socket.connected && currentUserId.value) {
      socket.emit('typing-stop', {
        fromUserId: currentUserId.value,
        toUserId: toUserId
      })
      isTyping.value = false
      console.log('⌨️ Stopped typing to:', toUserId)
    }
  }

  const handleTyping = (toUserId: string) => {
    startTyping(toUserId)
    
    // Auto stop typing after 3 seconds
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    typingTimeout = setTimeout(() => {
      stopTyping(toUserId)
    }, 3000)
  }

  // Socket event handlers
  const handleNewMessage = (data: { message: Message; fromUserId: string; toUserId: string }) => {
    const { message, fromUserId, toUserId } = data
    console.log('📨 New message received:', message._id, 'from:', fromUserId)
    
    // Add message to current conversation if it matches
    if ((fromUserId === selectedUserId.value && toUserId === currentUserId.value) ||
        (fromUserId === currentUserId.value && toUserId === selectedUserId.value)) {
      
      // Check if message already exists to avoid duplicates
      const existingMessage = messages.value.find(msg => msg._id === message._id)
      if (!existingMessage) {
        messages.value.push(message)
      }
    }
    
    // Update conversations list
    if (currentUserId.value) {
      updateConversationsList(fromUserId, toUserId, message)
    }
    
    // Auto-mark as delivered if user is active
    if (toUserId === currentUserId.value && socket && socket.connected) {
      socket.emit('message-delivered', {
        messageId: message._id,
        userId: currentUserId.value
      })
    }
  }

  const handleMessageDelivered = (data: MessageStatusData) => {
    console.log('✅ Message delivered:', data.messageId)
    const message = messages.value.find(msg => msg._id === data.messageId)
    if (message && message.status === 'sent') {
      message.status = 'delivered'
    }
  }

  const handleMessageRead = (data: MessageStatusData) => {
    console.log('👁️ Message read:', data.messageId)
    const message = messages.value.find(msg => msg._id === data.messageId)
    if (message) {
      message.status = 'read'
    }
  }

  const handleMessagesRead = (data: { messageIds: string[]; userId: string }) => {
    console.log('👁️ Multiple messages read:', data.messageIds.length)
    messages.value.forEach(msg => {
      if (data.messageIds.includes(msg._id)) {
        msg.status = 'read'
      }
    })
    
    // Update conversation unread count
    const conv = conversations.value.find(c => c.user._id === data.userId)
    if (conv) {
      conv.unreadCount = Math.max(0, conv.unreadCount - data.messageIds.length)
    }
  }

  const handleTypingStart = (data: TypingData) => {
    if (data.userId === selectedUserId.value) {
      typingUsers.value.add(data.userId)
      console.log('⌨️ User started typing:', data.userName || data.userId)
    }
  }

  const handleTypingStop = (data: TypingData) => {
    typingUsers.value.delete(data.userId)
    console.log('⌨️ User stopped typing:', data.userName || data.userId)
  }

  // Register socket listeners
  const registerSocketListeners = () => {
    if (!socket || socketListenersRegistered) return
    
    console.log('🔌 Registering chat socket listeners...')
    
    // Connection events
    socket.on('connect', () => {
      socketConnected.value = true
      console.log('✅ Chat socket connected')
    })
    
    socket.on('disconnect', () => {
      socketConnected.value = false
      console.log('❌ Chat socket disconnected')
    })
    
    // Message events
    socket.on('new-message', handleNewMessage)
    socket.on('message-delivered', handleMessageDelivered)
    socket.on('message-read', handleMessageRead)
    socket.on('messages-read', handleMessagesRead)
    
    // Typing events
    socket.on('typing-start', handleTypingStart)
    socket.on('typing-stop', handleTypingStop)
    
    // Conversation events
    socket.on('conversation-updated', (data: { userId: string }) => {
      if (data.userId === currentUserId.value) {
        fetchConversations(data.userId)
      }
    })
    
    socketListenersRegistered = true
    console.log('✅ Chat socket listeners registered')
  }

  // Initialize socket connection
  const initializeSocket = async () => {
    try {
      if (!currentUserId.value) {
        throw new Error('Current user ID not set')
      }
      
      console.log('🔄 Initializing chat socket for user:', currentUserId.value)
      
      socket = $socket.get()
      if (!socket) {
        throw new Error('Socket instance not found')
      }
      
      socketConnected.value = socket.connected
      registerSocketListeners()
      
      // Join user's chat room
      socket.emit('join-chat', { userId: currentUserId.value })
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize chat socket'
      console.error('❌ Chat socket initialization failed:', err)
    }
  }

  // Set current user
  const setCurrentUser = (userId: string) => {
    currentUserId.value = userId
    console.log('👤 Current user set:', userId)
  }

  // Set selected user for chat
  const setSelectedUser = (userId: string) => {
    selectedUserId.value = userId
    typingUsers.value.clear() // Clear typing indicators when switching users
    console.log('💬 Selected user for chat:', userId)
  }

  // Get unread messages count for a user
  const getUnreadCount = (userId: string) => {
    const conversation = conversations.value.find(conv => conv.user._id === userId)
    return conversation?.unreadCount || 0
  }

  // Auto-mark messages as read when viewing conversation
  const markCurrentConversationAsRead = async () => {
    if (!currentUserId.value || !selectedUserId.value) return
    
    const unreadMessages = messages.value.filter(msg => 
      msg.toUserId._id === currentUserId.value && 
      msg.userId._id === selectedUserId.value && 
      msg.status !== 'read'
    )
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id)
      await markMessagesAsRead(messageIds, currentUserId.value)
    }
  }

  // Check if any user is typing
  const isAnyoneTyping = computed(() => {
    return typingUsers.value.size > 0
  })

  // Get typing users list
  const getTypingUsers = computed(() => {
    return Array.from(typingUsers.value)
  })

  // Cleanup
  const cleanup = () => {
    if (socket) {
      socket.off('new-message', handleNewMessage)
      socket.off('message-delivered', handleMessageDelivered)
      socket.off('message-read', handleMessageRead)
      socket.off('messages-read', handleMessagesRead)
      socket.off('typing-start', handleTypingStart)
      socket.off('typing-stop', handleTypingStop)
      socket.off('conversation-updated')
      socket.off('connect')
      socket.off('disconnect')
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    socketListenersRegistered = false
    console.log('🧹 Chat socket listeners cleaned up')
  }

  // Lifecycle hooks
  onMounted(() => {
    console.log('🚀 Chat composable mounted')
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    messages: readonly(messages),
    conversations: readonly(conversations),
    loading: readonly(loading),
    error: readonly(error),
    currentUserId: readonly(currentUserId),
    selectedUserId: readonly(selectedUserId),
    socketConnected: readonly(socketConnected),
    isAnyoneTyping,
    getTypingUsers,
    
    // Methods
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    fetchConversations,
    setCurrentUser,
    setSelectedUser,
    getUnreadCount,
    markCurrentConversationAsRead,
    initializeSocket,
    handleTyping,
    stopTyping,
    cleanup,
    
    // Real-time methods
    startTyping
  }
}