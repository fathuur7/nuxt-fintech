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

export const useAdminList = (): UseUsersListReturn => {
  const users = ref<User[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const socketConnected = ref<boolean>(false)
  const lastUpdate = ref<string>('')
  const selectedUserId = ref<string | null>(null)

  const { $socket } = useNuxtApp()
  const { fetchUserData, getUserId } = useProfile()
  const { setSelectedUser, getUnreadCount } = useChat()
  const { users: usersData, loading: usersLoading, error: usersError, fetchUsers: fetchUsersData } = useUsers()

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

  const refreshUsers = async (): Promise<void> => {
    await fetchUsers()
  }

  const updateUserStatus = (data: StatusUpdateData): void => {
    const userIndex = users.value.findIndex(user => user._id === data.userId)
    if (userIndex !== -1) {
      const user = users.value[userIndex]
      if (data.status) {
        user.status = data.status
      } else if (data.isActive !== undefined) {
        user.status = data.isActive ? 'online' : 'offline'
      }
      user.updatedAt = data.timestamp || new Date().toISOString()
      lastUpdate.value = new Date().toLocaleTimeString('id-ID')
      console.log(`📊 Status updated: ${user.name} is now ${user.status}`)
    } else {
      console.log('👤 User not found in current list, refreshing...')
      refreshUsers()
    }
  }

  const registerSocketListeners = (socket: any, userId: string): void => {
    socket.on('connect', () => {
      socketConnected.value = true
      console.log('✅ Socket connected')
      socket.emit('user-active', userId)
      refreshUsers()
    })

    socket.on('disconnect', (reason: string) => {
      socketConnected.value = false
      console.log('❌ Socket disconnected:', reason)
    })

    const statusEvents = ['status-update', 'user-status-update', 'status-changed']
    statusEvents.forEach(event => {
      socket.on(event, (data: StatusUpdateData) => {
        console.log(`📡 Received ${event}:`, data)
        updateUserStatus(data)
      })
    })

    socket.on('user-online', (data: StatusUpdateData) => {
      updateUserStatus({ userId: data.userId || data._id!, status: 'online', timestamp: data.timestamp })
    })
    socket.on('user-idle', (data: StatusUpdateData) => {
      updateUserStatus({ userId: data.userId || data._id!, status: 'idle', timestamp: data.timestamp })
    })
    socket.on('user-offline', (data: StatusUpdateData) => {
      updateUserStatus({ userId: data.userId || data._id!, status: 'offline', timestamp: data.timestamp })
    })
    socket.on('user-forced-offline', (data: StatusUpdateData) => {
      updateUserStatus({ userId: data.userId || data._id!, status: 'offline', timestamp: data.timestamp })
    })

    console.log('✅ Socket listeners registered')
  }

  const initializeSocket = async (): Promise<void> => {
    try {
      await fetchUserData()
      const userId = getUserId()
      if (!userId) throw new Error('User ID not found')

      console.log('🔄 Initializing socket for user:', userId)

      await $socket.setUserOnline(userId)
      const socket = $socket.get()
      if (!socket) throw new Error('Socket instance not found')

      socketConnected.value = socket.connected
      registerSocketListeners(socket, userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize socket'
      console.error('❌ Socket init failed:', err)
    }
  }

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
