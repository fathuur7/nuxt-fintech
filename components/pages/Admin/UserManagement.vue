<!-- components/pages/Admin/UserManagement.vue -->
<template>
  <div class="min-h-screen">
    <div class="">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p class="text-gray-600">Kelola pengguna dan monitor status online</p>
        <div class="mt-2 text-sm text-gray-500">
          Realtime Status: 
          <span :class="isConnected ? 'text-green-600' : 'text-red-600'">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
          <span class="ml-4">Last Update: {{ lastUpdate }}</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ users.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <div class="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Online</p>
              <p class="text-2xl font-semibold text-gray-900">{{ onlineUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <div class="w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Idle</p>
              <p class="text-2xl font-semibold text-gray-900">{{ idleUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <div class="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Offline</p>
              <p class="text-2xl font-semibold text-gray-900">{{ offlineUsers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Daftar Pengguna</h2>
          <div class="flex gap-2">
            <button 
              @click="toggleAutoRefresh"
              :class="autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'"
              class="px-4 py-2 text-white rounded-md text-sm"
            >
              Auto Refresh: {{ autoRefresh ? 'ON' : 'OFF' }}
            </button>
            <button 
              @click="refreshUsers"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terakhir Aktif
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img class="h-10 w-10 rounded-full object-cover" :src="user.avatar_url || getDefaultAvatar(user)" :alt="user.username">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp {{ user.balance.toLocaleString('id-ID') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-3 w-3 rounded-full mr-2"
                         :class="getStatusColor(user.status)"></div>
                    <span class="text-sm font-medium capitalize"
                          :class="getStatusTextColor(user.status)">
                      {{ getStatusText(user.status) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.last_seen || user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    @click="forceOfflineUser(user.id)"
                    class="text-red-600 hover:text-red-900 text-xs"
                  >
                    Force Offline
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="users.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pengguna</h3>
          <p class="mt-1 text-sm text-gray-500">Belum ada pengguna yang terdaftar.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/lib/supabase'

type User = Database['public']['Tables']['users']['Row']

// Use Supabase composables
const { getAllUsers } = useSupabaseProfile()
const { subscribeToUserStatus, isConnected } = useSupabaseRealtime()
const { getUserId } = useProfile()

// Reactive data
const users = ref<User[]>([])
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

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-green-800'
    case 'idle': return 'text-yellow-800'
    case 'offline': return 'text-red-800'
    default: return 'text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Online'
    case 'idle': return 'Idle'
    case 'offline': return 'Offline'
    default: return 'Unknown'
  }
}

const getDefaultAvatar = (user: User) => {
  const name = user.username || user.email
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128&bold=true`
}

// Functions
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

      if (error) {
        console.error('Error forcing user offline:', error)
      } else {
        console.log(`🔴 Force offline request completed for user: ${userId}`)
        // Refresh users list
        setTimeout(() => {
          fetchUsers()
        }, 1000)
      }
    } catch (error) {
      console.error('Error forcing user offline:', error)
    }
  }
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

// Initialize realtime subscription
const initializeRealtimeSubscription = () => {
  statusSubscription = subscribeToUserStatus((payload) => {
    console.log('📡 Received user status update:', payload)
    updateUserStatus(payload)
  })
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Admin dashboard mounting...')
  
  // Fetch users first
  await fetchUsers()
  
  // Initialize realtime subscription
  if (process.client) {
    initializeRealtimeSubscription()
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
})
</script>