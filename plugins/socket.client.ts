import { io, Socket } from 'socket.io-client'

interface SocketState {
  socket: Socket | null
  currentUserId: string | null
  heartbeatInterval: NodeJS.Timeout | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  isConnecting: boolean
  connectionPromise: Promise<Socket | null> | null
}

export default defineNuxtPlugin(() => {
  const state: SocketState = {
    socket: null,
    currentUserId: null,
    heartbeatInterval: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    isConnecting: false,
    connectionPromise: null
  }

  const config = useRuntimeConfig()
  const SOCKET_URL = String(config.public.socketUrl || 'http://localhost:3002')

  const init = async (): Promise<Socket | null> => {
    // Prevent multiple simultaneous connection attempts
    if (state.isConnecting && state.connectionPromise) {
      return state.connectionPromise
    }

    // Return existing socket if already connected
    if (state.socket?.connected) {
      return state.socket
    }

    state.isConnecting = true
    
    state.connectionPromise = new Promise((resolve) => {
      try {
        // Clean up existing socket if any
        if (state.socket) {
          state.socket.removeAllListeners()
          state.socket.disconnect()
        }

        state.socket = io(SOCKET_URL, {
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: state.maxReconnectAttempts,
          timeout: 20000,
          transports: ['polling', 'websocket'], // Try both transports
          upgrade: true,
          rememberUpgrade: true,
          forceNew: true
        })

        // Connection successful
        state.socket.on('connect', () => {
          console.log('✅ Socket connected:', state.socket?.id)
          state.reconnectAttempts = 0
          state.isConnecting = false
          
          if (state.currentUserId && state.socket) {
            state.socket.emit('user-active', state.currentUserId)
            startHeartbeat()
          }
          
          resolve(state.socket)
        })

        // Connection failed
        state.socket.on('connect_error', (error) => {
          console.error('🔴 Socket connection error:', error.message)
          state.reconnectAttempts++
          
          if (state.reconnectAttempts >= state.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached')
            state.isConnecting = false
            resolve(null)
          }
        })

        // Disconnection
        state.socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
          stopHeartbeat()
          state.isConnecting = false
          
          // Auto-reconnect for certain disconnect reasons
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            setTimeout(() => {
              if (state.currentUserId) {
                setUserOnline(state.currentUserId)
              }
            }, 1000)
          }
        })

        // Successful reconnection
        state.socket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`)
          state.reconnectAttempts = 0
          
          if (state.currentUserId && state.socket) {
            state.socket.emit('user-active', state.currentUserId)
            startHeartbeat()
          }
        })

        // Reconnection attempt
        state.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 Reconnection attempt ${attemptNumber}`)
        })

        // Reconnection failed
        state.socket.on('reconnect_failed', () => {
          console.error('❌ Reconnection failed')
          state.isConnecting = false
          resolve(null)
        })

        // Admin force offline
        state.socket.on('force-offline', () => {
          console.log('💥 Forced offline by admin')
          handleForceOffline()
        })

        // Pong response for heartbeat
        state.socket.on('pong', () => {
          console.log('💓 Heartbeat pong received')
        })

      } catch (error) {
        console.error('Failed to initialize socket:', error)
        state.isConnecting = false
        resolve(null)
      }
    })

    return state.connectionPromise
  }

  const setUserOnline = async (userId: string): Promise<boolean> => {
    if (!userId || typeof userId !== 'string') {
      console.error('❌ Invalid userId:', userId)
      return false
    }

    state.currentUserId = userId

    try {
      const socket = await init()
      
      if (socket?.connected) {
        socket.emit('user-active', userId)
        startHeartbeat()
        console.log(`🟢 User ${userId} set online`)
        return true
      } else {
        console.error('❌ Could not connect socket for user:', userId)
        return false
      }
    } catch (error) {
      console.error('❌ Error setting user online:', error)
      return false
    }
  }

  const setUserOffline = async (userId: string): Promise<void> => {
    const userToOffline = userId || state.currentUserId
    
    if (!userToOffline) {
      console.error('❌ No userId provided for offline')
      return
    }

    if (state.socket?.connected) {
      state.socket.emit('user-inactive', userToOffline)
      console.log(`🟠 User ${userToOffline} set offline`)
    }
    
    stopHeartbeat()
  }

  const logout = (userId?: string): void => {
    const userToLogout = userId || state.currentUserId
    
    if (state.socket?.connected && userToLogout) {
      state.socket.emit('user-logout', userToLogout)
      console.log(`🚪 User ${userToLogout} logged out`)
    }
    
    cleanup()
  }

  const startHeartbeat = (): void => {
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval)
    }
    
    state.heartbeatInterval = setInterval(() => {
      if (state.socket?.connected && state.currentUserId) {
        state.socket.emit('heartbeat', state.currentUserId)
      } else {
        // Try to reconnect if heartbeat fails
        if (state.currentUserId) {
          console.log('💔 Heartbeat failed, attempting reconnection...')
          setUserOnline(state.currentUserId)
        }
      }
    }, 30000) // 30 seconds
  }

  const stopHeartbeat = (): void => {
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval)
      state.heartbeatInterval = null
    }
  }

  const cleanup = (): void => {
    stopHeartbeat()
    
    if (state.socket) {
      state.socket.removeAllListeners()
      state.socket.disconnect()
      state.socket = null
    }
    
    state.currentUserId = null
    state.reconnectAttempts = 0
    state.isConnecting = false
    state.connectionPromise = null
  }

  const handleForceOffline = (): void => {
    cleanup()
    
    if (process.client && typeof window !== 'undefined') {
      // Show user-friendly notification
      const event = new CustomEvent('socket:force-offline', {
        detail: { message: 'You have been logged out by administrator' }
      })
      window.dispatchEvent(event)
    }
  }

  const emit = (event: string, data?: any): boolean => {
    if (state.socket?.connected) {
      state.socket.emit(event, data)
      return true
    } else {
      console.warn(`❌ Cannot emit '${event}': Socket not connected`)
      return false
    }
  }

  const on = (event: string, callback: (...args: any[]) => void): void => {
    if (state.socket) {
      state.socket.on(event, callback)
    } else {
      console.warn(`❌ Cannot listen to '${event}': Socket not initialized`)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void): void => {
    if (state.socket) {
      if (callback) {
        state.socket.off(event, callback)
      } else {
        state.socket.removeAllListeners(event)
      }
    }
  }

  // Browser event handlers - only run on client side
  if (process.client && typeof window !== 'undefined') {
    let idleTimeout: NodeJS.Timeout | null = null

    const handleBeforeUnload = (): void => {
      if (state.currentUserId) {
        setUserOffline(state.currentUserId)
      }
    }

    const handleVisibilityChange = (): void => {
      if (!state.currentUserId) return

      if (document.hidden) {
        // Set user as idle after 10 seconds of being hidden
        idleTimeout = setTimeout(() => {
          if (document.hidden && state.socket?.connected && state.currentUserId) {
            state.socket.emit('user-idle', state.currentUserId)
            console.log(`😴 User ${state.currentUserId} idle`)
          }
        }, 10000)
      } else {
        // Clear idle timeout when page becomes visible
        if (idleTimeout) {
          clearTimeout(idleTimeout)
          idleTimeout = null
        }

        // Reactivate user
        if (state.socket?.connected) {
          state.socket.emit('user-active', state.currentUserId)
          console.log(`👀 User ${state.currentUserId} active`)
        } else if (state.currentUserId) {
          // Reconnect if socket is not connected
          setUserOnline(state.currentUserId)
        }
      }
    }

    const handleOnline = (): void => {
      console.log('🌐 Browser online')
      if (state.currentUserId) {
        setUserOnline(state.currentUserId)
      }
    }

    const handleOffline = (): void => {
      console.log('🌐 Browser offline')
      stopHeartbeat()
    }

    // Activity detection
    let lastActivity = Date.now()
    const updateActivity = (): void => {
      lastActivity = Date.now()
    }

    const checkActivity = (): void => {
      const now = Date.now()
      const idleTime = now - lastActivity
      
      // If idle for more than 5 minutes, emit idle status
      if (idleTime > 300000 && state.socket?.connected && state.currentUserId) {
        state.socket.emit('user-idle', state.currentUserId)
      }
    }

    // Use nextTick to ensure DOM is ready
    nextTick(() => {
      if (typeof window !== 'undefined') {
        // Event listeners
        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        window.addEventListener('unload', cleanup)
        
        // Document event listeners
        if (typeof document !== 'undefined') {
          document.addEventListener('visibilitychange', handleVisibilityChange)
          
          // Activity tracking
          const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] as const
          activityEvents.forEach((event) => {
            document.addEventListener(event, updateActivity, { passive: true })
          })
        }

        // Check activity every minute
        setInterval(checkActivity, 60000)
      }
    })
  }

  return {
    provide: {
      socket: {
        // Connection management
        init,
        get: () => state.socket,
        isConnected: () => state.socket?.connected || false,
        reconnect: () => {
          if (state.currentUserId) {
            return setUserOnline(state.currentUserId)
          }
          return Promise.resolve(false)
        },

        // User state management
        setUserOnline,
        setUserOffline,
        logout,
        getCurrentUserId: () => state.currentUserId,

        // Event handling
        emit,
        on,
        off,

        // Utility methods
        getConnectionState: () => ({
          connected: state.socket?.connected || false,
          userId: state.currentUserId,
          reconnectAttempts: state.reconnectAttempts,
          isConnecting: state.isConnecting
        }),

        // Room management
        joinRoom: (roomName: string) => {
          if (state.socket?.connected) {
            state.socket.emit('join_room', roomName)
            return true
          }
          return false
        },

        leaveRoom: (roomName: string) => {
          if (state.socket?.connected) {
            state.socket.emit('leave_room', roomName)
            return true
          }
          return false
        }
      }
    }
  }
})