import { ref } from 'vue'
import type { User } from '~/types/user'

export const useProfile = () => {
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const err = ref<string | null>(null)
  const users = ref<User[]>([])
  const lastUpdate = ref<string>('')


  // Fetch user data from JWT token
  const fetchUserData = async () => {
    try {
      isLoading.value = true
      
      // Get token from cookie
      const token = useCookie('token')
      
      if (!token.value) {
        await navigateTo('auth/login')
        return
      }

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
        console.log('User data set:', user.value)
        console.log('User ID (_id):', user.value._id) // ← Fixed: Use _id instead of id
      } else {
        console.error('Invalid response structure:', response)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // If token is invalid, redirect to login
      await navigateTo('auth/login')
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Set user offline before logging out
      const { $socket } = useNuxtApp()
      if (user.value?._id) { // ← Fixed: Use _id instead of id
        $socket.setUserOffline(user.value._id)
      }
      
      // Clear token cookie
      const token = useCookie('token')
      token.value = null
      
      // Clear user data
      user.value = null
      
      // Optional: Call logout API endpoint
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      // Redirect to login
      await navigateTo('auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      await navigateTo('auth/login')
    }
  }

  // Helper function to get user ID
  const getUserId = (): string | null => {
    return user.value?._id || null // ← Fixed: Use _id instead of id
  }

  // Initialize user data on composable creation (only on client)
  if (process.client) {
    fetchUserData()
  }


  return {
    user: readonly(user),
    users: readonly(users),
    err: readonly(err),
    isLoading: readonly(isLoading),
    fetchUserData,
    logout,
    getUserId
  }
}