import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useProfile } from '@/composables/useProfie'
import { useChat } from '@/composables/useChat'

interface User {
  _id: string
  name: string
  email: string
  picture: string
  role: string
  status: 'online' | 'offline' | 'idle'
  updatedAt?: string
}

interface StatusUpdateData {
  userId: string
  status?: 'online' | 'offline' | 'idle'
  isActive?: boolean
  timestamp?: string
  _id?: string
}

interface UseAdminListReturn {
  users: Ref<User[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  socketConnected: Ref<boolean>
  lastUpdate: Ref<string>
  selectedUserId: Ref<string | null>
  fetchAdminUsers: () => Promise<void>
  selectUser: (user: User) => void
  getUnreadCount: (userId: string) => number
  initializeSocket: () => Promise<void>
  refreshUsers: () => Promise<void>
}

export const useAdminList = (): UseAdminListReturn => {
  const users = ref<User[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const socketConnected = ref<boolean>(false)
  const lastUpdate = ref<string>('')
  const selectedUserId = ref<string | null>(null)

  const { $socket } = useNuxtApp()
  const { fetchUserData, getUserId } = useProfile()
  const { 
    setSelectedUser, 
    getUnreadCount, 
    initializeSocket: initializeChatSocket,
    setCurrentUser,
    fetchConversations 
  } = useChat()

  let socketInstance: any = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  const fetchAdminUsers = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const token = useCookie('token').value
      if (!token) {
        throw new Error('Authentication token not found')
      }
      
      const response = await $fetch<{ success: boolean; data: any[] }>('/api/user/getAdmin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.success && Array.isArray(response.data)) {
        users.value = response.data.map((user: any) => ({
          ...user,
          status: user.status || 'offline'
        }))
        console.log('✅ Admin users fetched:', users.value.length)
        lastUpdate.value = new Date().toLocaleTimeString('id-ID')
      } else {
        throw new Error('Invalid response format from admin API')
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch admin users'
      console.error('❌ Error fetching admin users:', err)
    } finally {
      loading.value = false
    }
  }

  const selectUser = async (user: User): Promise<void> => {
    try {
      selectedUserId.value = user._id
      setSelectedUser(user._id)
      
      const currentUserId = getUserId()
      if (currentUserId) {
        const { fetchMessages } = useChat()
        await fetchMessages(currentUserId, user._id)
        console.log('💬 Loaded messages for conversation with:', user.name)
      }
      
      console.log('👤 Selected admin user:', user.name)
    } catch (err) {
      console.error('❌ Error selecting user:', err)
    }
  }

  const refreshUsers = async (): Promise<void> => {
    await fetchAdminUsers()
  }

  const updateUserStatus = (data: StatusUpdateData): void => {
    try {
      const userIndex = users.value.findIndex(user => user._id === data.userId || user._id === data._id)
      if (userIndex !== -1) {
        const user = users.value[userIndex]
        if (data.status) {
          user.status = data.status
        } else if (data.isActive !== undefined) {
          user.status = data.isActive ? 'online' : 'offline'
        }
        user.updatedAt = data.timestamp || new Date().toISOString()
        lastUpdate.value = new Date().toLocaleTimeString('id-ID')
        console.log(`📊 Admin status updated: ${user.name} is now ${user.status}`)
      }
    } catch (err) {
      console.error('❌ Error updating user status:', err)
    }
  }

  const cleanupSocketListeners = (): void => {
    if (socketInstance) {
      // Remove all listeners
      const events = [
        'connect', 'disconnect', 'connect_error', 'reconnect', 'reconnect_failed',
        'admin-status-update', 'user-status-update', 'status-changed',
        'admin-online', 'admin-idle', 'admin-offline', 'admin-forced-offline',
        'new-admin-message', 'message-read-admin', 'admin-list-update',
        'user-joined-chat', 'user-left-chat'
      ]
      
      events.forEach(event => {
        socketInstance.off(event)
      })
      
      console.log('🧹 Socket listeners cleaned up')
    }
  }

  const registerSocketListeners = (socket: any, userId: string): void => {
    // Clean up existing listeners first
    cleanupSocketListeners()
    socketInstance = socket

    socket.on('connect', () => {
      socketConnected.value = true
      reconnectAttempts = 0
      console.log('✅ Socket connected for admin panel')
      
      // Emit user active status
      socket.emit('user-active', userId)
      socket.emit('join-admin-room', { userId })
      
      // Refresh data on reconnect
      refreshUsers()
    })

    socket.on('disconnect', (reason: string) => {
      socketConnected.value = false
      console.log('❌ Socket disconnected:', reason)
      
      // Attempt to reconnect if not intentional
      if (reason !== 'io client disconnect' && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++
          console.log(`🔄 Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts}`)
          socket.connect()
        }, 2000 * reconnectAttempts)
      }
    })

    socket.on('connect_error', (err: any) => {
      console.error('❌ Socket connect error:', err)
      socketConnected.value = false
      error.value = 'Connection error: ' + err.message
    })

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts')
      socketConnected.value = true
      error.value = null
    })

    socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed')
      socketConnected.value = false
      error.value = 'Failed to reconnect to server'
    })

    // Status update events
    const statusEvents = ['admin-status-update', 'user-status-update', 'status-changed']
    statusEvents.forEach(event => {
      socket.on(event, (data: StatusUpdateData) => {
        console.log(`📡 Received ${event}:`, data)
        updateUserStatus(data)
      })
    })

    // Specific admin status events
    socket.on('admin-online', (data: StatusUpdateData) => {
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'online', 
        timestamp: data.timestamp 
      })
    })

    socket.on('admin-idle', (data: StatusUpdateData) => {
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'idle', 
        timestamp: data.timestamp 
      })
    })

    socket.on('admin-offline', (data: StatusUpdateData) => {
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'offline', 
        timestamp: data.timestamp 
      })
    })

    socket.on('admin-forced-offline', (data: StatusUpdateData) => {
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'offline', 
        timestamp: data.timestamp 
      })
    })

    // Chat-related events
    socket.on('new-admin-message', (data: { fromUserId: string; toUserId: string; message: any }) => {
      console.log('📨 New message in admin panel:', data)
      
      const currentUserId = getUserId()
      if (currentUserId) {
        fetchConversations(currentUserId)
      }
      
      const userIndex = users.value.findIndex(user => user._id === data.fromUserId)
      if (userIndex !== -1) {
        users.value[userIndex].updatedAt = new Date().toISOString()
      }
    })

    socket.on('message-read-admin', (data: { userId: string; messageIds: string[] }) => {
      console.log('👁️ Messages read in admin panel:', data)
      
      const currentUserId = getUserId()
      if (currentUserId) {
        fetchConversations(currentUserId)
      }
    })

    socket.on('admin-list-update', () => {
      console.log('📋 Admin list update received')
      refreshUsers()
    })

    socket.on('user-joined-chat', (data: { userId: string; userInfo: any }) => {
      console.log('👋 User joined chat:', data.userInfo?.name || data.userId)
      updateUserStatus({ 
        userId: data.userId, 
        status: 'online', 
        timestamp: new Date().toISOString() 
      })
    })

    socket.on('user-left-chat', (data: { userId: string }) => {
      console.log('👋 User left chat:', data.userId)
      updateUserStatus({ 
        userId: data.userId, 
        status: 'offline', 
        timestamp: new Date().toISOString() 
      })
    })

    console.log('✅ Admin socket listeners registered')
  }

  const initializeSocket = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      // Ensure user data is loaded
      await fetchUserData()
      const userId = getUserId()
      if (!userId) {
        throw new Error('User ID not found - please login again')
      }

      console.log('🔄 Initializing admin socket for user:', userId)

      // Initialize socket connection
      try {
        await $socket.setUserOnline(userId)
      } catch (socketError) {
        console.warn('⚠️ Socket setUserOnline failed, continuing:', socketError)
      }

      const socket = $socket.get()
      if (!socket) {
        throw new Error('Socket instance not available')
      }

      // Check initial connection state
      socketConnected.value = socket.connected
      
      // Register listeners
      registerSocketListeners(socket, userId)
      
      // Force connection if not connected
      if (!socket.connected) {
        console.log('🔌 Socket not connected, attempting to connect...')
        socket.connect()
      }
      
      // Initialize chat functionality
      try {
        setCurrentUser(userId)
        await initializeChatSocket()
        await fetchConversations(userId)
      } catch (chatError) {
        console.warn('⚠️ Chat initialization failed:', chatError)
      }
      
    } catch (err: any) {
      error.value = err?.message || 'Failed to initialize admin socket'
      console.error('❌ Admin socket init failed:', err)
      socketConnected.value = false
    } finally {
      loading.value = false
    }
  }

  const getUnreadCountEnhanced = (userId: string): number => {
    try {
      return getUnreadCount(userId) || 0
    } catch (err) {
      console.warn('⚠️ Error getting unread count:', err)
      return 0
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    console.log('🧹 Cleaning up admin list composable')
    cleanupSocketListeners()
    
    // Emit user offline if socket is available
    const socket = $socket.get()
    const userId = getUserId()
    if (socket && userId && socket.connected) {
      socket.emit('user-inactive', userId)
    }
  })

  onMounted(async () => {
    console.log('🚀 Admin list composable mounted')
    
    try {
      // Initialize in sequence with error handling
      await initializeSocket()
      await fetchAdminUsers()
    } catch (err) {
      console.error('❌ Failed to initialize admin list:', err)
    }
  })

  return {
    users,
    loading,
    error,
    socketConnected,
    lastUpdate,
    selectedUserId,
    fetchAdminUsers,
    selectUser,
    getUnreadCount: getUnreadCountEnhanced,
    initializeSocket,
    refreshUsers
  }
}