// composables/useSocket.ts
export const useSocket = () => {
  const { $socket } = useNuxtApp()

  // Initialize socket connection
  const initSocket = async () => {
    try {
      await $socket.init()
      return true
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      return false
    }
  }

  // Set user online
  const goOnline = async (userId: string) => {
    if (!userId) {
      console.error('User ID is required to go online')
      return false
    }
    
    try {
      await $socket.setUserOnline(userId)
      return true
    } catch (error) {
      console.error('Failed to set user online:', error)
      return false
    }
  }

  // Logout user (proper offline)
  const logout = (userId?: string) => {
    $socket.logout(userId)
  }

  // Force offline (for admin or testing)
  const goOffline = (userId?: string, disconnect = false) => {
    $socket.setUserOffline(userId, disconnect)
  }

  // Get current user ID
  const getCurrentUserId = () => {
    return $socket.getCurrentUserId()
  }

  // Get connection status
  const isConnected = () => {
    return $socket.getConnectionStatus()
  }

  // Manual reconnect
  const reconnect = () => {
    $socket.reconnect()
  }

  // Get raw socket instance (for custom events)
  const getSocket = () => {
    return $socket.get()
  }

  // Listen to custom events
  const on = (event: string, callback: (...args: any[]) => void) => {
    const socket = getSocket()
    if (socket) {
      socket.on(event, callback)
    }
  }

  // Remove event listener
  const off = (event: string, callback?: (...args: any[]) => void) => {
    const socket = getSocket()
    if (socket) {
      socket.off(event, callback)
    }
  }

  // Emit custom events
  const emit = (event: string, ...args: any[]) => {
    const socket = getSocket()
    if (socket && socket.connected) {
      socket.emit(event, ...args)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  return {
    // Connection management
    initSocket,
    goOnline,
    logout,
    goOffline,
    reconnect,
    
    // Status
    getCurrentUserId,
    isConnected,
    
    // Raw socket access
    getSocket,
    
    // Event handling
    on,
    off,
    emit
  }
}