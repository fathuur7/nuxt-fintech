// composables/useSocket.ts
import type { Socket } from 'socket.io-client'

export const useSocket = () => {
  const nuxtApp = useNuxtApp()
  const $socket = (nuxtApp as any).$socket as {
    // Connection management
    init: () => Promise<Socket | null>
    get: () => Socket | null
    isConnected: () => boolean
    reconnect: () => Promise<boolean>
    
    // User state management
    setUserOnline: (userId: string) => Promise<boolean>
    setUserOffline: (userId: string) => Promise<void>
    logout: (userId?: string) => void
    getCurrentUserId: () => string | null
    
    // Event handling
    emit: (event: string, data?: any) => boolean
    on: (event: string, callback: (...args: any[]) => void) => void
    off: (event: string, callback?: (...args: any[]) => void) => void
    
    // Utility methods
    getConnectionState: () => {
      connected: boolean
      userId: string | null
      reconnectAttempts: number
      isConnecting: boolean
    }
    
    // Room management
    joinRoom: (roomName: string) => boolean
    leaveRoom: (roomName: string) => boolean
  }

  if (!$socket) {
    throw new Error('$socket is not available in Nuxt app context')
  }

  // Initialize socket connection
  const initSocket = async (): Promise<boolean> => {
    try {
      const socket = await $socket.init()
      return socket !== null
    } catch (error) {
      console.error('Failed to initialize socket:', error)
      return false
    }
  }

  // Set user online
  const goOnline = async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.error('User ID is required to go online')
      return false
    }
    
    try {
      return await $socket.setUserOnline(userId)
    } catch (error) {
      console.error('Failed to set user online:', error)
      return false
    }
  }

  // Set user offline
  const goOffline = async (userId?: string): Promise<void> => {
    const userToOffline = userId || $socket.getCurrentUserId()
    if (userToOffline) {
      await $socket.setUserOffline(userToOffline)
    }
  }

  // Logout user (proper cleanup)
  const logout = (userId?: string): void => {
    $socket.logout(userId)
  }

  // Get current user ID
  const getCurrentUserId = (): string | null => {
    return $socket.getCurrentUserId()
  }

  // Get raw socket instance (for custom events)
  const getSocket = (): Socket | null => {
    return $socket.get()
  }

  // Manual reconnect
  const reconnect = async (): Promise<boolean> => {
    try {
      return await $socket.reconnect()
    } catch (error) {
      console.error('Failed to reconnect:', error)
      return false
    }
  }

  // Check connection status
  const isConnected = (): boolean => {
    return $socket.isConnected()
  }

  // Get detailed connection state
  const getConnectionState = () => {
    return $socket.getConnectionState()
  }

  // Listen to custom events
  const on = (event: string, callback: (...args: any[]) => void): void => {
    $socket.on(event, callback)
  }

  // Remove event listener
  const off = (event: string, callback?: (...args: any[]) => void): void => {
    $socket.off(event, callback)
  }

  // Emit custom events
  const emit = (event: string, ...args: any[]): boolean => {
    return $socket.emit(event, ...args)
  }

  // Join a room
  const joinRoom = (roomName: string): boolean => {
    return $socket.joinRoom(roomName)
  }

  // Leave a room
  const leaveRoom = (roomName: string): boolean => {
    return $socket.leaveRoom(roomName)
  }

  // Utility function to wait for connection
  const waitForConnection = async (timeout = 10000): Promise<boolean> => {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (isConnected()) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return false
  }

  // Utility function to emit with connection check
  const safeEmit = async (event: string, data?: any, waitForConn = true): Promise<boolean> => {
    if (!isConnected() && waitForConn) {
      const connected = await waitForConnection()
      if (!connected) {
        console.warn(`Cannot emit '${event}': Socket not connected`)
        return false
      }
    }
    
    return emit(event, data)
  }

  // Enhanced user status management
  const setUserActive = (userId?: string): boolean => {
    const user = userId || getCurrentUserId()
    if (user) {
      return emit('user-active', user)
    }
    return false
  }

  const setUserIdle = (userId?: string): boolean => {
    const user = userId || getCurrentUserId()
    if (user) {
      return emit('user-idle', user)
    }
    return false
  }

  const setUserInactive = (userId?: string): boolean => {
    const user = userId || getCurrentUserId()
    if (user) {
      return emit('user-inactive', user)
    }
    return false
  }

  // Heartbeat manual trigger
  const sendHeartbeat = (userId?: string): boolean => {
    const user = userId || getCurrentUserId()
    if (user) {
      return emit('heartbeat', user)
    }
    return false
  }

  return {
    // Connection management
    initSocket,
    reconnect,
    isConnected,
    getConnectionState,
    waitForConnection,
    
    // User state management
    goOnline,
    goOffline,
    logout,
    getCurrentUserId,
    setUserActive,
    setUserIdle,
    setUserInactive,
    sendHeartbeat,
    
    // Raw socket access
    getSocket,
    
    // Event handling
    on,
    off,
    emit,
    safeEmit,
    
    // Room management
    joinRoom,
    leaveRoom
  }
}