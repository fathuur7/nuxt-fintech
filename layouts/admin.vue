<!-- layouts/admin.vue -->
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-white/95 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading admin panel...</p>
      </div>
    </div>

    <!-- Page Transition Loading Bar -->
    <div 
      v-if="isPageTransitioning" 
      class="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"
    >
      <div class="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-loading-bar"></div>
    </div>

    <!-- Main Layout -->
    <template v-else-if="user">
      <!-- Sidebar -->
      <aside 
        class="fixed left-0 top-0 h-full bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white transition-all duration-300 ease-in-out z-40 shadow-2xl border-r border-slate-700"
        :class="sidebarCollapsed ? 'w-16' : 'w-72'"
      >
        <!-- Logo/Brand -->
        <div class="px-6 py-5 border-b border-slate-700/50">
          <div class="flex items-center justify-center">
            <div v-if="!sidebarCollapsed" class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">AP</span>
              </div>
              <h2 class="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
            <div v-else class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">AP</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="py-6 flex-1 overflow-y-auto">
          <ul class="space-y-2 px-3">
            <li v-for="menuItem in filteredNavigationMenu" :key="menuItem.path">
              <NuxtLink 
                :to="menuItem.path" 
                @click="handleNavigation"
                class="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group relative overflow-hidden"
                active-class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/20"
              >
                <!-- Active indicator -->
                <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>
                
                <i class="w-5 h-5 mr-4 text-center flex items-center justify-center">{{ menuItem.icon }}</i>
                <span v-if="!sidebarCollapsed" class="group-hover:translate-x-1 transition-transform font-medium">
                  {{ menuItem.label }}
                </span>
                
                <!-- Hover effect background -->
                <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- User Info Section (when collapsed) -->
        <div v-if="sidebarCollapsed && user" class="px-3 py-4 border-t border-slate-700/50">
          <div class="flex justify-center">
            <img :src="userAvatar" :alt="user.name || user.username" class="w-8 h-8 rounded-full border-2 border-blue-500/30 shadow-lg">
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="px-6 py-4 border-t border-slate-700/50">
          <button 
            @click="handleLogout" 
            class="flex items-center w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-red-600/20 rounded-xl transition-all duration-200 group"
            :disabled="isLoggingOut"
            :class="{ 'opacity-60 cursor-not-allowed': isLoggingOut }"
          >
            <i class="w-5 h-5 mr-4 flex items-center justify-center">🚪</i>
            <span v-if="!sidebarCollapsed" class="group-hover:translate-x-1 transition-transform font-medium">
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div 
        class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        :class="sidebarCollapsed ? 'ml-16' : 'ml-72'"
      >
        <!-- Top Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm backdrop-blur-sm bg-white/95 sticky top-0 z-30">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button 
                @click="toggleSidebar" 
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              >
                <i class="text-xl">☰</i>
              </button>
              <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>
            
            <div class="flex items-center space-x-4">  
              <!-- User Profile -->
              <div class="relative">
                <button 
                  @click="toggleUserMenu"
                  class="flex items-center space-x-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img :src="userAvatar" :alt="user.name || user.username" class="w-8 h-8 rounded-full object-cover shadow-sm">
                  <div class="hidden sm:block text-left">
                    <div class="text-sm font-medium text-gray-900">{{ displayName }}</div>
                    <div class="text-xs text-gray-500">{{ userRole }}</div>
                  </div>
                  <i class="text-gray-400 text-sm">⌄</i>
                </button>
                
                <!-- User Dropdown Menu -->
                <div 
                  v-if="userMenuOpen" 
                  class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 backdrop-blur-sm"
                >
                  <div class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-200">
                    <div class="flex items-center space-x-3">
                      <img :src="userAvatar" :alt="user.name || user.username" class="w-10 h-10 rounded-full object-cover shadow-sm">
                      <div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="border-t border-gray-200 py-2">
                    <button 
                      @click="handleLogout" 
                      class="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      :disabled="isLoggingOut"
                    >
                      <i class="w-4 h-4 mr-3">🚪</i>
                      {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-6 overflow-y-auto bg-gray-50 relative">
          <!-- Page Loading Overlay -->
          <div 
            v-if="isPageTransitioning" 
            class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div class="text-center">
              <div class="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-gray-600 text-sm">Loading page...</p>
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

    <!-- Error State (when user is null and not loading) -->
    <div v-else class="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div class="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div class="text-6xl mb-4">🔒</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p class="text-gray-600 mb-6">You need to be logged in to access the admin panel.</p>
        <button 
          @click="redirectToLogin"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
  return route.meta?.title || 'Admin Dashboard'
})

const displayName = computed(() => {
  if (!user.value) return 'Unknown User'
  return user.value.name || user.value.username || 'Admin User'
})

const userAvatar = computed(() => {
  if (user.value?.avatar) {
    return user.value.avatar
  }
  // Generate a default avatar based on user's name, username, or email
  const name = user.value?.name || user.value?.username || user.value?.email || 'Admin'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`
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

const handleNavigation = () => {
  showPageTransition()
  closeUserMenu()
  if (isMobile.value) {
    closeSidebar()
  }
}

const handleMenuNavigation = () => {
  showPageTransition()
  closeUserMenu()
}

const showPageTransition = () => {
  isPageTransitioning.value = true
  
  // Hide loading after navigation completes
  setTimeout(() => {
    isPageTransitioning.value = false
  }, 800)
}

const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  try {
    isLoggingOut.value = true
    userMenuOpen.value = false
    
    // Show confirmation dialog (optional)
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

// Watch for route changes to handle page transitions
const route = useRoute()
watch(() => route.path, () => {
  isPageTransitioning.value = false
})

// Lifecycle hooks
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

// Set page meta for admin access control
definePageMeta({
  layout: false,
  middleware: 'auth' // You can create this middleware for additional checks
})
</script>

<style scoped>
/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Loading bar animation */
@keyframes loading-bar {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-loading-bar {
  animation: loading-bar 2s ease-in-out infinite;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>