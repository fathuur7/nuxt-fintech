import { ref, onMounted, type Ref } from 'vue'

interface User {
  _id: string
  name: string
  email: string
  picture: string
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

interface UseUsersListReturn {
  users: Ref<User[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  socketConnected: Ref<boolean>
  lastUpdate: Ref<string>
  selectedUserId: Ref<string | null>
  fetchUsers: () => Promise<void>
  selectUser: (user: User) => void
  getUnreadCount: (userId: string) => number
  initializeSocket: () => Promise<void>
  refreshUsers: () => Promise<void>
}

export const useUsersList = (): UseUsersListReturn => {
  // State
  const users = ref<User[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const socketConnected = ref<boolean>(false)
  const lastUpdate = ref<string>('')
  const selectedUserId = ref<string | null>(null)

  // Dependencies
  const { $socket } = useNuxtApp()
  const { fetchUserData, getUserId } = useProfile()
  const { users: usersData, loading: usersLoading, error: usersError, fetchUsers: fetchUsersData } = useUsers()

  // Methods
  const fetchUsers = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      await fetchUsersData()
      users.value = usersData.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      console.error('❌ Error fetching users:', err)
    } finally {
      loading.value = usersLoading.value
    }
  }

  const selectUser = (user: User): void => {
    selectedUserId.value = user._id
    setSelectedUser(user._id)
    console.log('👤 Selected user:', user.name)
  }

  const updateUserStatus = (data: StatusUpdateData): void => {
    const userIndex = users.value.findIndex(user => user._id === data.userId)
    
    if (userIndex !== -1) {
      const user = users.value[userIndex]
      
      // Handle both status and isActive fields
      if (data.status) {
        user.status = data.status
      } else if (data.isActive !== undefined) {
        user.status = data.isActive ? 'online' : 'offline'
      }
      
      user.updatedAt = data.timestamp || new Date().toISOString()
      lastUpdate.value = new Date().toLocaleTimeString('id-ID')
      
      console.log(`📊 Status updated: ${user.name} is now ${user.status}`)
    } else {
      // User not found in current list, refresh to get updated data
      console.log('👤 User not found in current list, refreshing...')
      refreshUsers()
    }
  }

  const refreshUsers = async (): Promise<void> => {
    await fetchUsers()
  }

  const registerSocketListeners = (socket: any, adminUserId: string): void => {
    // Connection status listeners
    socket.on('connect', () => {
      socketConnected.value = true
      console.log('✅ Admin socket connected')
      
      // Re-emit admin as active on reconnect
      socket.emit('user-active', adminUserId)
      refreshUsers()
    })
    
    socket.on('disconnect', (reason: string) => {
      socketConnected.value = false
      console.log('❌ Admin socket disconnected:', reason)
    })
    
    // Status update listeners
    const statusEvents = [
      'status-update',
      'user-status-update',
      'status-changed'
    ]
    
    statusEvents.forEach(event => {
      socket.on(event, (data: StatusUpdateData) => {
        console.log(`📡 Received ${event}:`, data)
        updateUserStatus(data)
      })
    })
    
    // Specific status listeners
    socket.on('user-online', (data: StatusUpdateData) => {
      console.log('🟢 User came online:', data)
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'online',
        timestamp: data.timestamp
      })
    })
    
    socket.on('user-idle', (data: StatusUpdateData) => {
      console.log('🟡 User went idle:', data)
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'idle',
        timestamp: data.timestamp
      })
    })
    
    socket.on('user-offline', (data: StatusUpdateData) => {
      console.log('🔴 User went offline:', data)
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'offline',
        timestamp: data.timestamp
      })
    })

    socket.on('user-forced-offline', (data: StatusUpdateData) => {
      console.log('💥 User forced offline:', data)
      updateUserStatus({ 
        userId: data.userId || data._id!, 
        status: 'offline',
        timestamp: data.timestamp
      })
    })
    
    console.log('✅ Socket listeners registered successfully')
  }

  const initializeSocket = async (): Promise<void> => {
    try {
      // Fetch current user data and set as online
      await fetchUserData()
      
      const adminUserId = getUserId()
      if (!adminUserId) {
        throw new Error('No admin user ID available')
      }

      console.log('🔄 Initializing admin socket for user:', adminUserId)
      
      // Set admin user as online
      await $socket.setUserOnline(adminUserId)
      
      // Get socket instance
      const socket = $socket.get()
      
      if (!socket) {
        throw new Error('Socket instance not available')
      }

      socketConnected.value = socket.connected
      registerSocketListeners(socket, adminUserId)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize socket'
      console.error('❌ Failed to initialize admin socket:', err)
    }
  }

  // Initialize on mount
  onMounted(async () => {
    await Promise.all([
      initializeSocket(),
      fetchUsers()
    ])
  })

  return {
    users,
    loading,
    error,
    socketConnected,
    lastUpdate,
    selectedUserId,
    fetchUsers,
    selectUser,
    getUnreadCount,
    initializeSocket,
    refreshUsers
  }
}