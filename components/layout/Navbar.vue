<template>
  <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
    <nav class="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div class="flex items-center justify-between px-6 py-3">
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FinTech
          </span>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            to="/loan" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            Pinjaman
          </NuxtLink>
          <NuxtLink 
            to="/transactions" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            Transaksi
          </NuxtLink>
          <NuxtLink 
            to="/portfolio" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            Portfolio
          </NuxtLink>
          <NuxtLink 
            to="/analytics" 
            class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          >
            Analytics
          </NuxtLink>
        </div>

        <!-- User Profile & Actions -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19v-7a8 8 0 1116 0v7a2 2 0 01-2 2H6a2 2 0 01-2-2z"/>
            </svg>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Profile Dropdown -->
          <div class="relative" ref="profileDropdown">
            <button 
              @click="toggleDropdown"
              class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <div class="relative">
                <img 
                  :src="getUserPicture()" 
                  :alt="user?.name || 'User'"
                  class="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                  @error="handleImageError"
                  loading="lazy"
                />
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
                <p class="text-xs text-gray-500">{{ formatBalance(user?.balance || 0) }}</p>
              </div>
              <svg 
                class="w-4 h-4 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': isDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div 
                v-show="isDropdownOpen"
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <div class="flex items-center space-x-3">
                    <img 
                      :src="getUserPicture()" 
                      :alt="user?.name || 'User'"
                      class="w-10 h-10 rounded-full object-cover"
                      @error="handleImageError"
                      loading="lazy"
                    />
                    <div>
                      <p class="font-medium text-gray-900">{{ user?.name }}</p>
                      <p class="text-sm text-gray-500">{{ user?.email }}</p>
                    </div>
                  </div>
                </div>

                <div class="py-2">
                  <NuxtLink 
                    to="/profile" 
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    @click="closeDropdown"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Profile Saya
                  </NuxtLink>
            
                  <button 
                    @click="logout"
                    class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-200/50 px-6 py-4 space-y-3">
          <NuxtLink 
            to="/Loan" 
            class="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            @click="closeMobileMenu"
          >
            Pinjaman
          </NuxtLink>
          <NuxtLink 
            to="/transactions" 
            class="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            @click="closeMobileMenu"
          >
            Transaksi
          </NuxtLink>
          <NuxtLink 
            to="/portfolio" 
            class="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            @click="closeMobileMenu"
          >
            Portfolio
          </NuxtLink>
          <NuxtLink 
            to="/analytics" 
            class="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            @click="closeMobileMenu"
          >
            Analytics
          </NuxtLink>
        </div>
      </Transition>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Types
interface User {
  name: string
  email: string
  picture: string
  balance?: number
}

// Reactive state
const user = ref<User | null>(null)
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const profileDropdown = ref<HTMLElement>()

// Fetch user data from JWT token
const fetchUserData = async () => {
  try {
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

    console.log('API Response:', response) // Debug log
    
    // Extract data from response structure {success: true, data: {...}}
    if (response.success && response.data) {
      user.value = response.data
      console.log('User data set:', user.value) // Debug log
    } else {
      console.error('Invalid response structure:', response)
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    // If token is invalid, redirect to login
    await navigateTo('auth/login')
  }
}

// Toggle functions
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

// Get user picture with fallback
const getUserPicture = () => {
  if (!user.value?.picture) {
    return getDefaultAvatar()
  }
  
  // Check if it's a valid URL
  try {
    new URL(user.value.picture)
    return user.value.picture
  } catch {
    console.warn('Invalid picture URL:', user.value.picture)
    return getDefaultAvatar()
  }
}

// Generate default avatar SVG
const getDefaultAvatar = () => {
  const name = user.value?.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  
  // Generate color based on name
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ]
  const colorIndex = name.length % colors.length
  const bgColor = colors[colorIndex]
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
      <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
    </svg>
  `)}`
}

// Handle image loading error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('Image failed to load:', img.src)
  // Fallback to generated avatar
  img.src = getDefaultAvatar()
}

// Format balance
const formatBalance = (balance: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(balance)
}

// Logout function
const logout = async () => {
  try {
    // Clear token cookie
    const token = useCookie('token')
    token.value = null
    
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

// Lifecycle hooks
onMounted(() => {
  fetchUserData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar for dropdown if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>