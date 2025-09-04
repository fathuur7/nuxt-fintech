<!-- AdminChatDashboard.vue -->
<template>
  <div class="chat-container min-h-screen">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-lg mb-6 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Admin Chat Dashboard</h1>
          <p class="text-gray-600">Manage conversations with users in real-time</p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Connection Status -->
          <div class="flex items-center space-x-2">
            <div :class="socketConnected ? 'bg-green-500' : 'bg-red-500'" 
                 class="w-3 h-3 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium" :class="socketConnected ? 'text-green-700' : 'text-red-700'">
              {{ socketConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          
          <!-- User Statistics -->
          <div class="flex items-center space-x-2">
            <div class="bg-green-100 px-3 py-1 rounded-lg">
              <span class="text-green-800 font-semibold">{{ onlineUsers }} Online</span>
            </div>
            <div class="bg-yellow-100 px-3 py-1 rounded-lg">
              <span class="text-yellow-800 font-semibold">{{ idleUsers }} Idle</span>
            </div>
            <div class="bg-gray-100 px-3 py-1 rounded-lg">
              <span class="text-gray-800 font-semibold">{{ offlineUsers }} Offline</span>
            </div>
          </div>
          
          <!-- Auto Refresh Toggle -->
          <button @click="toggleAutoRefresh" 
                  :class="autoRefresh ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-4 py-2 rounded-lg font-medium transition-colors">
            {{ autoRefresh ? '⏸️ Auto' : '▶️ Auto' }}
          </button>
          
          <!-- Manual Refresh -->
          <button @click="refreshUsers" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <!-- Last Update Info -->
      <div v-if="lastUpdate" class="mt-4 text-sm text-gray-500">
        Last updated: {{ lastUpdate }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 font-medium">Loading users...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div class="text-red-600 text-lg font-semibold mb-2">❌ Error Loading Users</div>
      <p class="text-red-500">{{ error }}</p>
      <button @click="refreshUsers" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
        Try Again
      </button>
    </div>

    <!-- Users List -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="user in users" 
           :key="user._id"
           class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
           @click="navigateToChat(user._id)">
        
        <!-- User Card Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center space-x-4">
            <!-- Avatar -->
            <div class="relative">
              <div v-if="user.picture" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="user.picture" :alt="user.name" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {{ getInitials(user.name || user.email || '') }}
              </div>
              
              <!-- Online Status Indicator -->
              <div :class="getStatusColor(user.status)" 
                   class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full">
              </div>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 text-lg">
                {{ user.name || 'Anonymous User' }}
              </h3>
              <p class="text-gray-500 text-sm">{{ user.email || user._id }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusBadgeClass(user.status)">
                  {{ getStatusText(user.status) }}
                </span>
                <span v-if="user.role === 'admin'" class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Details and Actions -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <!-- User Balance -->
            <div class="text-sm text-gray-600">
              <span class="font-medium">Balance:</span> 
              <span class="text-green-600 font-semibold">{{ formatCurrency(user.balance) }}</span>
            </div>
            
            <!-- Account Status -->
            <div class="flex items-center space-x-2">
              <span :class="user.isActive ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                {{ user.isActive ? '✅ Active' : '❌ Inactive' }}
              </span>
            </div>
          </div>

          <!-- Last Activity -->
          <div class="text-sm text-gray-500 mb-4">
            <div class="flex justify-between">
              <span>Created:</span>
              <span>{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Updated:</span>
              <span>{{ formatDate(user.updatedAt) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button @click.stop="startChat(user._id)" 
                    class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              💬 Chat
            </button>
            <button @click.stop="viewProfile(user._id)" 
                    class="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              👤
            </button>
            <button v-if="user.status === 'online'" 
                    @click.stop="forceOfflineUser(user._id)" 
                    class="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
                    title="Force Offline">
              🔴
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && users.length === 0" 
         class="text-center py-16">
      <div class="text-6xl mb-4">👥</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
      <p class="text-gray-500 mb-6">There are no users registered in the system yet.</p>
      <button @click="refreshUsers" 
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Refresh List
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface User {
  _id: string
  name?: string
  email?: string
  role: 'admin' | 'user'
  balance: number
  status: 'online' | 'idle' | 'offline'
  isActive: boolean
  picture?: string
  createdAt: string
  updatedAt: string
}

// Router and composables
const router = useRouter()
const { fetchUserData, getUserId } = useProfile()
const { getAllUsers } = useSupabaseProfile()
const { subscribeToUserStatus, updatePresence, isConnected } = useSupabaseRealtime()

// Reactive state
const users = ref<any[]>([])
const loading = ref(true)
const lastUpdate = ref('')
const autoRefresh = ref(true)

// Auto refresh interval
let refreshInterval: NodeJS.Timeout | null = null
let statusSubscription: any = null

// Computed properties
const onlineUsers = computed(() => users.value.filter(user => user.status === 'online').length)
const idleUsers = computed(() => users.value.filter(user => user.status === 'idle').length)
const offlineUsers = computed(() => users.value.filter(user => user.status === 'offline').length)

// Status helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-400'
    case 'idle': return 'bg-yellow-400'
    case 'offline': return 'bg-red-400'
    default: return 'bg-gray-400'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-100 text-green-800'
    case 'idle': return 'bg-yellow-100 text-yellow-800'
    case 'offline': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return '🟢 Online'
    case 'idle': return '🟡 Idle'
    case 'offline': return '🔴 Offline'
    default: return '⚫ Unknown'
  }
}

// Utility functions
const getInitials = (name: string): string => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Main functions
const fetchUsers = async () => {
  try {
    loading.value = true
    const usersData = await getAllUsers()
    users.value = usersData || []
    lastUpdate.value = new Date().toLocaleTimeString('id-ID')
    console.log('📊 Fetched users:', users.value.length)
  } catch (err) {
    console.error('❌ Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  fetchUsers()
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    if (!isConnected.value) {
      console.log('🔄 Auto refresh: Realtime disconnected, fetching users...')
      fetchUsers()
    }
  }, 10000) // Every 10 seconds
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const updateUserStatus = (payload: any) => {
  const userData = payload.new
  const userIndex = users.value.findIndex(user => user.id === userData.id)
  
  if (userIndex !== -1) {
    users.value[userIndex] = { ...users.value[userIndex], ...userData }
    lastUpdate.value = new Date().toLocaleTimeString('id-ID')
    console.log(`📊 Status updated: ${userData.username} is now ${userData.status}`)
  } else {
    // User not found in current list, refresh to get updated data
    console.log('👤 User not found in current list, refreshing...')
    fetchUsers()
  }
}

const forceOfflineUser = async (userId: string) => {
  if (confirm('Apakah Anda yakin ingin memaksa user ini offline?')) {
    try {
      const { supabase } = useSupabase()
      
      const { error } = await supabase
        .from('users')
        .update({
          status: 'offline',
          is_active: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId)
    }
  }
}

// Navigation functions
const navigateToChat = (userId: string): void => {
  navigateTo(`/admin/chat/${userId}`)
}

const startChat = (userId: string): void => {
  navigateToChat(userId)
}

const viewProfile = (userId: string): void => {
  navigateTo(`/admin/users/${userId}`)
}

// Initialize admin realtime connection
const initializeAdminRealtime = async () => {
  try {
    // First, fetch current user data and set as online in presence
    await fetchUserData()
    
    const adminUserId = getUserId()
    if (!adminUserId) {
      console.error('❌ No admin user ID available')
      return
    }
    
    console.log('🔄 Initializing admin realtime for user:', adminUserId)
    
    // Set admin user as online in presence
    await updatePresence('online')
    
    // Subscribe to user status changes
    statusSubscription = subscribeToUserStatus((payload) => {
      console.log('📡 Received user status update:', payload)
      updateUserStatus(payload)
    })
    
    console.log('✅ Admin realtime subscription initialized')
  } catch (error) {
    console.error('❌ Failed to initialize admin realtime:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 Admin dashboard mounting...')
  
  // Fetch users first
  await fetchUsers()
  
  // Initialize realtime connection for admin
  if (process.client) {
    await initializeAdminRealtime()
  }
  
  // Start auto refresh if enabled
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  console.log('🔄 Admin dashboard unmounting...')
  
  // Stop auto refresh
  stopAutoRefresh()
  
  // Unsubscribe from realtime
  if (statusSubscription) {
    statusSubscription.unsubscribe()
    console.log('✅ Realtime subscription removed')
  }
  
  // Set admin user offline in presence
  updatePresence('offline').catch(console.error)
})

// Page meta
definePageMeta({
  title: 'Admin Chat Dashboard',
  layout: 'admin',
  middleware: 'auth',
  meta: [
    { name: 'description', content: 'Admin dashboard for managing user conversations in real-time' },
    { name: 'keywords', content: 'admin, chat, messaging, real-time, dashboard' }
  ]
})
</script>

<style scoped>
.chat-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>