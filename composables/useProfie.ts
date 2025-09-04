import type { Database } from '~/lib/supabase'
type User = Database['public']['Tables']['users']['Row']
export const useProfile = () => {
  const { user: authUser, loading: authLoading, getCurrentUserId } = useSupabaseAuth()
  const { user: profileUser, loading: profileLoading, error, fetchUserProfile, updateUserStatus } = useSupabaseProfile()
  const { updatePresence } = useSupabaseRealtime()
  
  const user = computed(() => profileUser.value || authUser.value)
  const isLoading = computed(() => authLoading.value || profileLoading.value)
  const err = computed(() => error.value)
  // Fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        console.log('No user ID found, redirecting to login')
        await navigateTo('/auth/login')
        return
      }
      console.log('Fetching user profile for:', userId)
      const userData = await fetchUserProfile(userId)
      
      if (userData) {
        console.log('✅ User data successfully loaded:', userData)
        
        // Emit user data loaded event
        if (process.client) {
          window.dispatchEvent(new CustomEvent('user-loaded', { detail: userData }))
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      
      // If user not found or unauthorized, redirect to login
      await navigateTo('/auth/login')
    }
  }
  // Logout function using Supabase auth
  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...')
      
      // Set user offline in presence
      if (process.client && user.value?.id) {
        try {
          await updatePresence('offline')
          await updateUserStatus('offline', false)
          console.log('🔴 User set offline')
        } catch (error) {
          console.warn('⚠️ Failed to update status on logout:', error)
        }
      }
      
      // Use Supabase auth logout
      const { signOut } = useSupabaseAuth()
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
  
  // Helper function to get user ID
  const getUserId = (): string | null => {
    const id = user.value?.id || getCurrentUserId()
    console.log('Getting user ID:', id)
    return id
  }
  // Helper function to get full user object
  const getUser = () => {
    return user.value
  }
  // Helper function to get user role
  const getUserRole = (): string => {
    return user.value?.role || 'user'
  }
  // Initialize user data on composable creation (only on client)
  if (process.client) {
    const userId = getCurrentUserId()
    if (userId && !profileUser.value) {
      console.log('🚀 Initializing user profile data...')
      fetchUserData()
    }
  }
  return {
    user: readonly(user),
    err: readonly(err),
    isLoading: readonly(isLoading),
    fetchUserData,
    logout,
    getUserId,
    getUser,
    getUserRole
  }
}