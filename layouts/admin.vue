<!-- layouts/admin.vue -->
<template>
  <div class="min-h-screen transition-colors duration-300" :class="isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center z-50" :class="isDarkMode ? 'bg-gray-900' : 'bg-white'">
      <div class="text-center">
        <div class="w-10 h-10 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Loading...</p>
      </div>
    </div>

    <!-- Page Transition Loading Bar -->
    <div 
      v-if="isPageTransitioning" 
      class="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-blue-500 to-purple-600"
    >
      <div class="h-full bg-gradient-to-r from-blue-600 to-purple-700 animate-loading-bar shadow-lg"></div>
    </div>

    <!-- Main Layout -->
    <template v-else-if="user">
      <!-- Sidebar -->
      <aside 
        class="fixed left-0 top-0 h-full border-r transition-all duration-300 z-40 backdrop-blur-xl"
        :class="[
          sidebarCollapsed ? 'w-20' : 'w-72',
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        ]"
      >
        <!-- Logo/Brand -->
        <div class="h-20 flex items-center justify-center border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div v-if="!sidebarCollapsed" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AdminPanel
              </h1>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Management System</p>
            </div>
          </div>
          <div v-else class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="mt-8 px-4">
          <ul class="space-y-2">
            <li v-for="menuItem in filteredNavigationMenu" :key="menuItem.path">
              <NuxtLink 
                :to="menuItem.path" 
                @click="handleNavigation"
                class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden"
                :class="[
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80',
                ]"
                active-class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-r-4 border-blue-500"
              >
                <span class="text-lg mr-4 transition-transform duration-200 group-hover:scale-110">{{ menuItem.icon }}</span>
                <span v-if="!sidebarCollapsed" class="font-semibold">{{ menuItem.label }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Sidebar Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <button 
            @click="handleLogout" 
            class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
            :class="[
              isDarkMode 
                ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50',
              { 'opacity-50 cursor-not-allowed': isLoggingOut }
            ]"
            :disabled="isLoggingOut"
          >
            <svg class="w-5 h-5 mr-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span v-if="!sidebarCollapsed" class="font-semibold">
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div 
        class="transition-all duration-300"
        :class="sidebarCollapsed ? 'ml-20' : 'ml-72'"
      >
        <!-- Top Header -->
        <header class="h-20 border-b flex items-center justify-between px-8 sticky top-0 z-30 backdrop-blur-xl" 
          :class="isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'"
        >
          <div class="flex items-center">
            <button 
              @click="toggleSidebar" 
              class="p-3 rounded-xl transition-all duration-200 mr-6 hover:scale-105"
              :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">{{ pageTitle }}</h1>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Welcome back, {{ displayName }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Dark Mode Toggle -->
            <button 
              @click="toggleDarkMode"
              class="p-3 rounded-xl transition-all duration-200 hover:scale-105"
              :class="isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            >
              <svg v-if="isDarkMode" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
            
            <!-- User Profile -->
            <div class="relative">
              <button 
                @click="toggleUserMenu"
                class="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:scale-105"
                :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
              >
                <div class="relative">
                  <img :src="userAvatar" :alt="user.name || user.username" class="w-10 h-10 rounded-xl object-cover border-2 border-gradient-to-r from-blue-500 to-purple-600">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div class="hidden sm:block text-left">
                  <div class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">{{ displayName }}</div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ userRole }}</div>
                </div>
                <svg class="w-5 h-5 transition-transform duration-200" :class="[
                  userMenuOpen ? 'rotate-180' : '',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- User Dropdown Menu -->
              <div 
                v-if="userMenuOpen" 
                class="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 backdrop-blur-xl overflow-hidden"
                :class="isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'"
              >
                <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <img :src="userAvatar" :alt="user.name || user.username" class="w-12 h-12 rounded-xl object-cover">
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div>
                      <div class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">{{ displayName }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ user.email }}</div>
                      <div class="text-xs px-2 py-1 rounded-full mt-1 inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {{ userRole }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="py-2">
                  <button class="flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 group"
                    :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                  >
                    <svg class="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </button>
                  <button class="flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 group"
                    :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
                  >
                    <svg class="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
                  </button>
                </div>
                
                <div class="border-t py-2" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <button 
                    @click="handleLogout" 
                    class="flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 group"
                    :class="isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'"
                    :disabled="isLoggingOut"
                  >
                    <svg class="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-8 min-h-[calc(100vh-5rem)] relative">
          <!-- Page Loading Overlay -->
          <div 
            v-if="isPageTransitioning" 
            class="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-20"
            :class="isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'"
          >
            <div class="text-center">
              <div class="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Loading...</p>
            </div>
          </div>
          
          <slot />
        </main>
      </div>

      <!-- Mobile Overlay -->
      <div 
        v-if="!sidebarCollapsed && isMobile" 
        class="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
        @click="closeSidebar"
      ></div>
    </template>

    <!-- Error State -->
    <div v-else class="min-h-screen flex items-center justify-center" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="text-center p-10 rounded-2xl shadow-2xl border max-w-md backdrop-blur-xl"
        :class="isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'"
      >
        <div class="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-800'">Access Denied</h2>
        <p class="mb-8 text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          You need to be authenticated to access the admin panel. Please login to continue.
        </p>
        <button 
          @click="redirectToLogin"
          class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Use the profile composable
const { user, isLoading, logout, getUserId } = useProfile()

// Reactive state
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)
const isMobile = ref(false)
const isLoggingOut = ref(false)
const isPageTransitioning = ref(false)
const isDarkMode = ref(false)

// Navigation menu configuration
const navigationMenu = ref([
  {
    path: '/admin',
    label: 'Dashboard',
    icon: '📊',
    roles: ['admin', 'moderator']
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: '👥',
    roles: ['admin']
  },
  {
    path: '/admin/track/loan',
    label: 'Track Loans',
    icon: '📅',
    roles: ['admin', 'moderator']
  },
  {
    path: '/admin/orders',
    label: 'Orders',
    icon: '🛒',
    roles: ['admin', 'moderator']
  },
  {
    path: '/admin/chat',
    label: 'Chat',
    icon: '💬',
    roles: ['admin']
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: '⚙️',
    roles: ['admin']
  }
])

// Computed properties
const pageTitle = computed(() => {
  const route = useRoute()
  return route.meta?.title || 'Dashboard'
})

const displayName = computed(() => {
  if (!user.value) return 'Unknown User'
  return user.value.name || user.value.username || 'AdminUser'
})

const userAvatar = computed(() => {
  if (user.value?.avatar) {
    return user.value.avatar
  }
  const name = user.value?.name || user.value?.username || user.value?.email || 'Admin'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128&bold=true`
})

const userRole = computed(() => {
  if (user.value?.role) {
    return user.value.role.charAt(0).toUpperCase() + user.value.role.slice(1)
  }
  return 'Administrator'
})

// Filter navigation menu based on user role
const filteredNavigationMenu = computed(() => {
  if (!user.value?.role) return navigationMenu.value
  
  return navigationMenu.value.filter(item => 
    !item.roles || item.roles.includes(user.value.role)
  )
})

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const handleNavigation = () => {
  showPageTransition()
  closeUserMenu()
  if (isMobile.value) {
    closeSidebar()
  }
}

const showPageTransition = () => {
  isPageTransitioning.value = true
  
  setTimeout(() => {
    isPageTransitioning.value = false
  }, 800)
}

const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  try {
    isLoggingOut.value = true
    userMenuOpen.value = false
    
    const confirmed = confirm('Are you sure you want to logout?')
    if (!confirmed) {
      isLoggingOut.value = false
      return
    }
    
    await logout()
  } catch (error) {
    console.error('Logout failed:', error)
    isLoggingOut.value = false
  }
}

const redirectToLogin = () => {
  showPageTransition()
  setTimeout(() => {
    navigateTo('/')
  }, 300)
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    userMenuOpen.value = false
  }
}

// Watch for route changes
const route = useRoute()
watch(() => route.path, () => {
  isPageTransitioning.value = false
})

// Lifecycle hooks
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  
  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    // Default to system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

// Set page meta
definePageMeta({
  layout: false,
  middleware: 'auth'
})
</script>

<style scoped>
/* Loading bar animation */
@keyframes loading-bar {
  0% { 
    transform: translateX(-100%); 
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% { 
    transform: translateX(100%); 
    opacity: 0;
  }
}

.animate-loading-bar {
  animation: loading-bar 1.5s ease-in-out;
}

/* Enhanced transitions */
* {
  transition-property: color, background-color, border-color, opacity, transform, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for dark mode */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f3f4f6; /* gray.100 */
}

.dark ::-webkit-scrollbar-track {
  background: #1f2937; /* gray.800 */
}

::-webkit-scrollbar-thumb {
  background: #d1d5db; /* gray.300 */
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563; /* gray.600 */
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray.400 */
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* gray.500 */
}


/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass morphism effect */
.glass-effect {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(209, 213, 219, 0.3);
}

.dark .glass-effect {
  background-color: rgba(17, 24, 39, 0.75);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

/* Enhanced shadow effects */
.shadow-luxury {
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

.dark .shadow-luxury {
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Smooth hover animations */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .hover-lift:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* Animated gradient background */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease infinite;
}

/* Enhanced focus states */
.focus-ring {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.dark .focus-ring:focus {
  box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.3);
}

/* Premium button styles */
.btn-premium {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-size: 200% 200%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-premium:hover {
  background-position: right center;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

/* Loading spinner enhancement */
@keyframes premium-spin {
  0% {
    transform: rotate(0deg);
    border-color: #3b82f6 transparent transparent transparent;
  }
  25% {
    border-color: #8b5cf6 transparent transparent transparent;
  }
  50% {
    transform: rotate(180deg);
    border-color: #ec4899 transparent transparent transparent;
  }
  75% {
    border-color: #f59e0b transparent transparent transparent;
  }
  100% {
    transform: rotate(360deg);
    border-color: #3b82f6 transparent transparent transparent;
  }
}

.premium-loading {
  animation: premium-spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Sidebar active state enhancement */
.router-link-active {
  position: relative;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border-left: 4px solid transparent;
  border-image: linear-gradient(135deg, #3b82f6, #8b5cf6) 1;
}

.dark .router-link-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
}

/* Notification dot pulse */
@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.pulse-dot {
  animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Menu item hover effect */
.menu-item {
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.menu-item:hover::before {
  left: 100%;
}

.dark .menu-item::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
}

.menu-item:hover::before {
  left: 100%;
}
.menu-item:hover {
  color: #3b82f6;
  transform: translateX(5px);
}
.menu-item:hover .menu-icon {
  transform: translateX(5px);
}
.menu-item:hover .menu-label {
  transform: translateX(5px);
}
.menu-item:hover .menu-icon,
.menu-item:hover .menu-label {
  transition: transform 0.3s ease;
}
</style>