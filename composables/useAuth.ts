export function useAuth() {
  const { user, session, loading, signInWithGoogle, signOut, getCurrentUserId } = useSupabaseAuth()
  const { updatePresence } = useSupabaseRealtime()
  
  const isLoggedIn = computed(() => !!session.value)

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Initialize realtime connection when user is authenticated
  const initializeRealtime = async () => {
    if (process.client && user.value?.id) {
      try {
        await updatePresence('online')
        console.log('✅ Realtime initialized for authenticated user')
      } catch (error) {
        console.error('❌ Failed to initialize realtime:', error)
      }
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...')
      
      // Set user offline in presence
      if (process.client && user.value?.id) {
        try {
          await updatePresence('offline')
          console.log('🔴 User set offline in presence')
        } catch (error) {
          console.warn('⚠️ Failed to update presence on logout:', error)
        }
      }
      
      // Sign out from Supabase
      await signOut()
      console.log('✅ User logged out successfully')
      
      // Redirect to login
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Even if logout fails, redirect to login page
      await navigateTo('/auth/login')
    }
  }

  // Auto-initialize realtime when auth state changes
  watch(isLoggedIn, async (newValue) => {
    if (newValue && user.value?.id) {
      await initializeRealtime()
    }
  }, { immediate: true })

  return {
    logout,
    isLoggedIn,
    loginWithGoogle,
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    initializeRealtime,
    getCurrentUserId
  }
}