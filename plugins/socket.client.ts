import { io, Socket } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  let socket: Socket | null = null
  let currentUserId: string | null = null
  let heartbeatInterval: NodeJS.Timeout | null = null

  const init = async (): Promise<Socket | null> => {
    if (!socket || !socket.connected) {
      try {
        socket = io('http://localhost:3002', {
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 5,
          timeout: 20000,
          // HANYA gunakan polling untuk menghindari WebSocket issues
          transports: ['polling'],
          upgrade: false, // Disable WebSocket upgrade
          rememberUpgrade: false
        })

        socket.on('connect', () => {
          console.log('✅ Socket connected via polling:', socket?.id)
          if (currentUserId && socket) {
            socket.emit('user-active', currentUserId)
            startHeartbeat()
          }
        })

        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
          stopHeartbeat()
        })

        socket.on('connect_error', (error) => {
          console.error('🔴 Socket connection error:', error)
        })

        socket.on('reconnect', () => {
          console.log('🔄 Socket reconnected')
          if (currentUserId && socket) {
            socket.emit('user-active', currentUserId)
            startHeartbeat()
          }
        })

        socket.on('force-offline', () => {
          console.log('💥 Forced offline by admin')
          handleForceOffline()
        })
        

        return socket
      } catch (error) {
        console.error('Failed to initialize socket:', error)
        return null
      }
    }
    return socket
  }

  const setUserOnline = async (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      console.error('❌ Invalid userId:', userId)
      return
    }

    currentUserId = userId

    if (!socket || !socket.connected) {
      await init()
    }

    if (socket && socket.connected) {
      socket.emit('user-active', userId)
      startHeartbeat()
      console.log(`🟢 User ${userId} online`)
    }
  }

  const logout = (userId?: string) => {
    const userToLogout = userId || currentUserId
    if (socket && socket.connected && userToLogout) {
      socket.emit('user-logout', userToLogout)
      console.log(`🚪 User ${userToLogout} logout`)
    }
    cleanup()
  }
  
  const startHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval)
    heartbeatInterval = setInterval(() => {
      if (socket && socket.connected && currentUserId) {
        socket.emit('heartbeat', currentUserId)
      }
    }, 30000)
  }

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  const cleanup = () => {
    stopHeartbeat()
    if (socket) {
      socket.disconnect()
      socket = null
    }
    currentUserId = null
  }

  const handleForceOffline = () => {
    cleanup()
    if (process.client) {
      alert('You have been logged out by administrator')
    }
  }

  if (import.meta.client) {
    const handleBeforeUnload = () => {
      if (socket && socket.connected && currentUserId) {
        socket.emit('user-logout', currentUserId)
      }
    }

    const handleVisibilityChange = () => {
      if (currentUserId) {
        if (document.hidden) {
          setTimeout(() => {
            if (document.hidden && socket && socket.connected && currentUserId) {
              socket.emit('user-idle', currentUserId)
            }
          }, 10000)
        } else {
          if (socket && socket.connected) {
            socket.emit('user-active', currentUserId)
          } else if (currentUserId) {
            setUserOnline(currentUserId)
          }
        }
      }
    }

    const handleOnline = () => {
      if (currentUserId) {
        setUserOnline(currentUserId)
      }
    }

    const handleOffline = () => {
      stopHeartbeat()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  return {
    provide: {
      socket: {
        init,
        get: () => socket,
        setUserOnline,
        logout,
        getCurrentUserId: () => currentUserId,
        isConnected: () => socket?.connected || false,
        reconnect: () => {
          if (currentUserId) {
            setUserOnline(currentUserId)
          }
        }
      }
    }
  }
})