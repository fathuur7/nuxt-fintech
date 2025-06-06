import { io, Socket } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  let socket: Socket | null = null
  let currentUserId: string | null = null
  let heartbeatInterval: NodeJS.Timeout | null = null
  let isNavigating = false
  let visibilityTimeout: NodeJS.Timeout | null = null

  const init = async (): Promise<Socket | null> => {
    if (!socket || !socket.connected) {
      try {
        socket = io('http://localhost:3002', {
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
          // Tingkatkan reconnection attempts untuk SPA navigation
          reconnectionDelayMax: 5000
        })

        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket?.id)
          if (currentUserId) {
            if (socket) {
              socket.emit('user-active', currentUserId)
            }
            startHeartbeat()
          }
        })

        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
          stopHeartbeat()
          
          // Jangan langsung offline untuk navigation
          if (!isNavigating) {
            console.log('🔄 Disconnect during navigation, attempting reconnect...')
          }
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

        // Handle forced offline dari server
        socket.on('force-offline', (data) => {
          console.log('💥 Received force offline from server')
          handleForceOffline()
        })

        await new Promise((resolve, reject) => {
          if (socket!.connected) {
            resolve(socket)
            return
          }

          const connectTimeout = setTimeout(() => {
            reject(new Error('Connection timeout'))
          }, 10000) // Increase timeout untuk stability

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
  }

  // Method untuk logout eksplisit
  const logout = (userId?: string) => {
    const userToLogout = userId || currentUserId

    if (socket && socket.connected && userToLogout) {
      socket.emit('user-logout', userToLogout)
      console.log(`🚪 User ${userToLogout} logging out`)
    }

    cleanup()
  }

  // Method untuk set offline manual (untuk testing atau admin)
  const setUserOffline = (userId?: string, disconnect = false) => {
    const userToSetOffline = userId || currentUserId

    if (socket && socket.connected && userToSetOffline) {
      socket.emit('user-offline', userToSetOffline)
      console.log(`🔴 Setting user ${userToSetOffline} offline`)
    }

    if (disconnect) {
      cleanup()
    }
  }

  // Handle navigation dalam SPA
  const handleNavigation = () => {
    isNavigating = true
    if (socket && socket.connected && currentUserId) {
      socket.emit('user-navigating', currentUserId)
      console.log('🔄 User navigating within app')
    }

    // Clear navigation flag setelah navigation selesai
    setTimeout(() => {
      isNavigating = false
      // Re-emit user-active untuk memastikan status online
      if (socket && socket.connected && currentUserId) {
        socket.emit('user-active', currentUserId)
      }
    }, 2000)
  }

  const startHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval)
    heartbeatInterval = setInterval(() => {
      if (socket && socket.connected && currentUserId && !document.hidden && !isNavigating) {
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
    if (visibilityTimeout) {
      clearTimeout(visibilityTimeout)
      visibilityTimeout = null
    }
    if (socket) {
      socket.disconnect()
      socket = null
    }
    currentUserId = null
    isNavigating = false
  }

  const handleForceOffline = () => {
    cleanup()
    // Redirect ke login atau tampilkan pesan
    if (process.client) {
      alert('You have been logged out by an administrator')
      // navigateTo('/login') // Uncomment jika menggunakan Nuxt navigation
    }
  }

  if (import.meta.client) {
    let isUnloading = false

    // Handle beforeunload (tutup tab/browser)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('🔴 Page unloading - setting user offline')
      isUnloading = true
      if (socket && socket.connected && currentUserId) {
        socket.emit('user-beforeunload', currentUserId)
        // Synchronous delay to ensure emit is sent
        const start = Date.now()
        while (Date.now() - start < 100) {}
      }
    }

    // Handle unload
    const handleUnload = () => {
      if (!isUnloading && currentUserId) {
        cleanup()
      }
    }

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Tab hidden - user might be switching tabs')
        
        // Clear any existing timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout)
        }
        
        // Set timeout untuk tab switch detection
        visibilityTimeout = setTimeout(() => {
          if (document.hidden && socket && socket.connected && currentUserId) {
            socket.emit('user-visibility-change', {
              userId: currentUserId,
              hidden: true
            })
            console.log('👁️ Tab has been hidden for too long, notifying server')
          }
        }, 5000) // 5 detik threshold untuk tab switch
        
      } else {
        console.log('👁️ Tab visible - user active again')
        
        // Clear tab switch timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout)
          visibilityTimeout = null
        }
        
        if (currentUserId) {
          if (socket && socket.connected) {
            socket.emit('user-visibility-change', {
              userId: currentUserId,
              hidden: false
            })
            socket.emit('user-active', currentUserId)
            startHeartbeat()
          } else {
            // Reconnect jika perlu
            setUserOnline(currentUserId)
          }
        }
      }
    }

    // Handle network status
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

    // Handle SPA navigation (untuk Nuxt router)
    const handleRouteChange = () => {
      handleNavigation()
    }

    // Event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen untuk Nuxt route changes
    const router = useRouter()
    router.beforeEach(() => {
      handleNavigation()
    })

    // History API untuk SPA navigation detection
    if (typeof window !== 'undefined' && window.history) {
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState
      
      window.history.pushState = function(...args) {
        handleNavigation()
        return originalPushState.apply(window.history, args)
      }
      
      window.history.replaceState = function(...args) {
        handleNavigation()
        return originalReplaceState.apply(window.history, args)
      }
      
      window.addEventListener('popstate', handleNavigation)
    }
  }

  return {
    provide: {
      socket: {
        init,
        get,
        setUserOnline,
        setUserOffline,
        handleNavigation,
        logout, // Method baru untuk logout
        getCurrentUserId: () => currentUserId,
        // Method tambahan untuk debugging
        getConnectionStatus: () => socket?.connected || false,
        reconnect: () => {
          if (socket && !socket.connected) {
            socket.connect()
          }
        }
      }
    }
  }
})