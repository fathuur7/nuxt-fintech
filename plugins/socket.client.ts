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
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        })
        
        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket?.id)
          
          // Re-emit user as active if we have a current user
          if (currentUserId) {
            socket?.emit('user-active', currentUserId)
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
          if (currentUserId) {
            socket?.emit('user-active', currentUserId)
          }
        })
        
        // Wait for connection
        await new Promise((resolve, reject) => {
          if (socket!.connected) {
            resolve(socket)
            return
          }
          
          const connectTimeout = setTimeout(() => {
            reject(new Error('Connection timeout'))
          }, 5000)
          
          socket!.on('connect', () => {
            clearTimeout(connectTimeout)
            resolve(socket)
          })
          
          socket!.on('connect_error', (error) => {
            clearTimeout(connectTimeout)
            reject(error)
          })
        })
        
        return socket
      } catch (error) {
        console.error('Failed to initialize socket:', error)
        return null
      }
    }
    return socket
  }

  const get = (): Socket | null => socket
  
 const setUserOnline = async (userId: string) => {
  try {
    // Validate userId parameter
    if (!userId || userId === 'undefined' || typeof userId !== 'string') {
      console.error('❌ Invalid userId provided to setUserOnline:', userId)
      return
    }
    
    currentUserId = userId
    
    if (!socket || !socket.connected) {
      await init()
    }
    
    if (socket && socket.connected) {
      socket.emit('user-active', userId)
      startHeartbeat()
      console.log(`🟢 Setting user ${userId} online`)
    } else {
      console.error('❌ Socket not connected after initialization')
    }
  } catch (error) {
    console.error('Error setting user online:', error)
  }
}

  const setUserOffline = (userId?: string) => {
    const userToSetOffline = userId || currentUserId
    
    if (socket && socket.connected && userToSetOffline) {
      // Emit user offline before disconnecting
      socket.emit('user-offline', userToSetOffline)
      console.log(`🔴 Setting user ${userToSetOffline} offline`)
    }
    
    stopHeartbeat()
    
    if (socket) {
      socket.disconnect()
    }
    
    socket = null
    currentUserId = null
  }

  // Heartbeat to keep connection alive and update last seen
  const startHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }
    
    heartbeatInterval = setInterval(() => {
      if (socket && socket.connected && currentUserId) {
        socket.emit('heartbeat', currentUserId)
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  // Enhanced cleanup handlers for better offline detection
  if (process.client) {
    let isUnloading = false
    
    // Handle page unload (closing tab, refreshing, navigating away)
    const handleBeforeUnload = () => {
      console.log('🔴 Page unloading - setting user offline')
      isUnloading = true
      
      if (socket && socket.connected && currentUserId) {
        // Use synchronous approach for beforeunload
        socket.emit('user-beforeunload', currentUserId)
        // Small delay to ensure message is sent
        const start = Date.now()
        while (Date.now() - start < 100) {
          // Busy wait for 100ms
        }
      }
    }

    // Additional unload handler
    const handleUnload = () => {
      if (!isUnloading && currentUserId) {
        setUserOffline()
      }
    }

    // Handle visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Tab hidden - user might be going inactive')
        // Don't immediately set offline, just reduce heartbeat frequency
      } else {
        console.log('📱 Tab visible - user active again')
        if (currentUserId && socket && socket.connected) {
          socket.emit('user-active', currentUserId)
          startHeartbeat()
        } else if (currentUserId) {
          // Reconnect if needed
          setUserOnline(currentUserId)
        }
      }
    }

    // Handle network status changes
    const handleOnline = () => {
      console.log('🌐 Network online - reconnecting socket')
      if (currentUserId) {
        setUserOnline(currentUserId)
      }
    }

    const handleOffline = () => {
      console.log('🌐 Network offline')
      stopHeartbeat()
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      setUserOffline()
    }

    // Handle SPA route changes
    if (window.addEventListener) {
      window.addEventListener('popstate', () => {
        // Don't set offline on route changes within the app
        console.log('🔄 Route change detected')
      })
    }
  }

  return {
    provide: {
      socket: {
        init,
        get,
        setUserOnline,
        setUserOffline,
        getCurrentUserId: () => currentUserId
      }
    }
  }
})