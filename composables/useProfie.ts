import { ref, readonly } from 'vue'
import type { User } from '~/types/user'

export const useProfile = () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const err = ref<string | null>(null)
  const users = ref<User[]>([])
  const lastUpdate = ref<string>('')

  const currentUser = useCookie<User | null>('currentUser')
  if (currentUser.value) {
    user.value = currentUser.value
    console.log('🚀 Current user loaded from cookie:', user.value)
  } else {
    console.log('No current user found in cookie, initializing as null')
    currentUser.value = null
  }
  // Update currentUser cookie whenever user changes
  
  
  // Fetch user data from JWT token
  const fetchUserData = async () => {
    try {
      isLoading.value = true
      err.value = null
      
      // Get token from cookie
      const token = useCookie('token')
      
      if (!token.value) {
        console.log('No token found, redirecting to login')
        await navigateTo('/auth/login')
        return
      }

      console.log('Fetching user profile with token:', token.value?.substring(0, 20) + '...')

      // Decode JWT to get user info or make API call
      const response = await $fetch<{ success: boolean, data: User }>('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      console.log('API Response:', response)
      
      // Extract data from response structure {success: true, data: {...}}
      if (response.success && response.data) {
        user.value = response.data
        console.log('✅ User data successfully set:', user.value)
        console.log('✅ User ID (_id):', user.value._id)
        
        // Emit user data loaded event
        if (process.client) {
          window.dispatchEvent(new CustomEvent('user-loaded', { detail: user.value }))
        }
      } else {
        console.error('❌ Invalid response structure:', response)
        err.value = 'Invalid response from server'
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      err.value = error instanceof Error ? error.message : 'Failed to fetch user data'
      
      // If token is invalid, redirect to login
      if (
        typeof error === 'object' &&
        error !== null &&
        ('statusCode' in error || 'status' in error) &&
        ((error as any).statusCode === 401 || (error as any).status === 401)
      ) {
        console.log('Token expired or invalid, redirecting to login')
        await navigateTo('/auth/login')
      }
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => {
        isLoading.value = false
        console.log('🔄 Loading state set to false')
      }, 500)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Set user offline before logging out
      const { $socket } = useNuxtApp()
      if (user.value?._id) {
        console.log('Setting user offline:', user.value._id)
        $socket.setUserOffline(user.value._id)
      }
      
      // Clear token cookie
      const token = useCookie('token')
      token.value = null
      
      // Clear user data
      user.value = null
      
      // Optional: Call logout API endpoint
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError)
      }
      
      // Redirect to login
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      await navigateTo('/auth/login')
    }
  }
  
  // Helper function to get user ID
  const getUserId = (): string | null => {
    const id = user.value?._id || null
    console.log('Getting user ID:', id)
    return id
  }

  // Helper function to get full user object
  const getUser = (): User | null => {
    return user.value
  }

  // Initialize user data on composable creation (only on client)
  if (process.client && !user.value) {
    console.log('🚀 Initializing user profile data...')
    fetchUserData()
  }

  return {
    user: readonly(user),
    users: readonly(users),
    err: readonly(err),
    isLoading: readonly(isLoading),
    lastUpdate: readonly(lastUpdate),
    fetchUserData,
    logout,
    getUserId,
    currentUser,
    getUser
  }
}