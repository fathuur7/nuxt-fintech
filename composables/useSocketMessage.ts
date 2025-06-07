import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

const socket = ref<Socket | null>(null)

export function useSocketDebug() {
  const messages = ref<any[]>([])
  const connected = ref(false)

  const connectSocket = (token: string) => {
    if (socket.value) return
    
    socket.value = io('http://localhost:3002', {
      auth: {
        token
      }
    })

    socket.value.on('connect', () => {
      connected.value = true
      console.log('Socket connected:', socket.value?.id)
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      console.log('Socket disconnected')
    })

    // Semua event message:* ditangkap
    const messageEvents = [
      'message:history',
      'message:error',
      'message:status_updated',
      'messages:unread_count',
      'messages:conversation_read',
      'receiveMessage'
    ]

    messageEvents.forEach(event => {
      socket.value?.on(event, (data) => {
        console.log(`[Socket] ${event}:`, data)
        messages.value.push({ event, data })
      })
    })
  }

  const sendMessage = (payload: {
    senderId: string,
    receiverId: string,
    text: string
  }) => {
    socket.value?.emit('message:send', payload)
  }

  const updateMessageStatus = (messageId: string, userId: string, status: 'delivered' | 'read') => {
    socket.value?.emit('message:update_status', { messageId, userId, status })
  }

  const markConversationRead = (otherUserId: string) => {
    socket.value?.emit('message:mark_conversation_read', { otherUserId })
  }

  const sendTyping = (senderId: string, receiverId: string, isTyping: boolean) => {
    socket.value?.emit('user:typing', { senderId, receiverId, isTyping })
  }

  const getHistory = (otherUserId: string, page = 1, limit = 20) => {
    socket.value?.emit('message:get_history', { otherUserId, page, limit })
  }

  const getUnreadCount = () => {
    socket.value?.emit('message:get_unread_count')
  }

  return {
    connectSocket,
    sendMessage,
    updateMessageStatus,
    markConversationRead,
    sendTyping,
    getHistory,
    getUnreadCount,
    messages,
    connected
  }
}
