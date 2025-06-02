import { ref } from "vue"

export const useChat = () => {
  const messages = ref<any[]>([])
  interface Conversation {
    user: { _id: string }
    unreadCount: number
    // add other properties as needed
  }
  const conversations = ref<Conversation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)
  const selectedUserId = ref<string | null>(null)

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
      } else {
        throw new Error(data.error || 'Failed to fetch messages')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('Error fetching messages:', err)
    } finally {
      loading.value = false
    }
  }

  // Send a message
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
        // Add new message to current messages if it's for the current conversation
        if ((userId === currentUserId.value && toUserId === selectedUserId.value) ||
            (userId === selectedUserId.value && toUserId === currentUserId.value)) {
          messages.value.push(data.data)
        }
        return data.data
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('Error fetching messages:', err)
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
    } catch (err) {
      console.error('Error marking messages as read:', err)
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
      } else {
        throw new Error(data.error || 'Failed to fetch conversations')
      }
    } catch (err) {
       error.value = err instanceof Error ? err.message : String(err)
      console.error('Error fetching messages:', err)
    }
  }

  // Set current user
  const setCurrentUser = (userId: string) => {
    currentUserId.value = userId
  }

  // Set selected user for chat
  const setSelectedUser = (userId: string) => {
    selectedUserId.value = userId
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

  return {
    messages: readonly(messages),
    conversations: readonly(conversations),
    loading: readonly(loading),
    error: readonly(error),
    currentUserId: readonly(currentUserId),
    selectedUserId: readonly(selectedUserId),
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    fetchConversations,
    setCurrentUser,
    setSelectedUser,
    getUnreadCount,
    markCurrentConversationAsRead
  }
}