export function useAuth() {
  const token = useCookie('token')
  const userRaw = useCookie('user')
  const user = computed(() => {
    try {
      return userRaw.value ? JSON.parse(userRaw.value) : null
    } catch {
      return null
    }
  })
  const isLoggedIn = computed(() => !!token.value)

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google'
  }

  // Initialize socket connection when user is authenticated
  const initializeSocket = async () => {
    if (process.client && user.value?._id) {
      const { $socket } = useNuxtApp()
      try {
        await $socket.setUserOnline(user.value._id)
        console.log('✅ Socket initialized for authenticated user')
      } catch (error) {
        console.error('❌ Failed to initialize socket:', error)
      }
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...')
      
      // Get current user ID before clearing cookies
      const currentUserId = user.value?._id
      
      // Set user offline via socket FIRST
      if (currentUserId && process.client) {
        const { $socket } = useNuxtApp()
        if ($socket) {
          console.log(`🔴 Setting user ${currentUserId} offline via socket`)
          $socket.setUserOffline(currentUserId)
          
          // Give a moment for the offline message to be sent
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // Clear cookies/session
      const userCookie = useCookie('user')
      const tokenCookie = useCookie('token')
      
      userCookie.value = null
      tokenCookie.value = null
      
      // Call backend logout API if exists
      try {
        await $fetch('/api/auth/logout', { 
          method: 'POST',
          // Don't throw on 401/403 errors since we're logging out anyway
          ignoreResponseError: true
        })
        console.log('✅ Backend logout completed')
      } catch (error) {
        console.warn('⚠️ Backend logout failed (this is usually fine):', error)
      }
      
      console.log('✅ User logged out successfully')
      
      // Redirect to login
      await navigateTo('auth/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Even if logout fails, redirect to login page
      await navigateTo('auth/login')
    }
  }

  // Auto-initialize socket when auth state changes
  watch(isLoggedIn, async (newValue) => {
    if (newValue && user.value?._id) {
      await initializeSocket()
    }
  }, { immediate: true })

  return {
    logout,
    isLoggedIn,
    loginWithGoogle,
    user: readonly(user),
    initializeSocket
  }
}