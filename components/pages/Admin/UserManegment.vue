<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p class="text-gray-600">Kelola pengguna dan monitor status online</p>
        <div class="mt-2 text-sm text-gray-500">
          Socket Status: 
          <span :class="socketConnected ? 'text-green-600' : 'text-red-600'">
            {{ socketConnected ? 'Connected' : 'Disconnected' }}
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
              <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img class="h-10 w-10 rounded-full object-cover" :src="user.picture" :alt="user.name">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
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
                  {{ formatDate(user.updatedAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    @click="forceOfflineUser(user._id)"
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
import type { User } from '~/types/user';

// Use profile to get current admin user
const { fetchUserData, getUserId } = useProfile();

// Reactive data
const users = ref<User[]>([]);
const loading = ref(true);
const socketConnected = ref(false);
const lastUpdate = ref('');
const autoRefresh = ref(true);

// Computed properties
const onlineUsers = computed(() => users.value.filter(user => user.status === 'online').length);
const idleUsers = computed(() => users.value.filter(user => user.status === 'idle').length);
const offlineUsers = computed(() => users.value.filter(user => user.status === 'offline').length);

// Socket connection
const { $socket } = useNuxtApp();

// Auto refresh interval
let refreshInterval: NodeJS.Timeout | null = null;

// Status helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-400';
    case 'idle': return 'bg-yellow-400';
    case 'offline': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-green-800';
    case 'idle': return 'text-yellow-800';
    case 'offline': return 'text-red-800';
    default: return 'text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Online';
    case 'idle': return 'Idle';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
};

// Functions
const fetchUsers = async () => {
  try {
    loading.value = true;
    const { data } = await $fetch('/api/user/getUser');
    users.value = (data || []).map((u: any) => ({
      _id: String(u._id),
      name: String(u.name),
      email: String(u.email),
      role: u.role === 'admin' ? 'admin' : 'user',
      balance: Number(u.balance),
      status: u.status === 'online' || u.status === 'idle' || u.status === 'offline' ? u.status : 'offline',
      isActive: Boolean(u.isActive),
      picture: String(u.picture),
      createdAt: String(u.createdAt),
      updatedAt: String(u.updatedAt)
    })) as User[];
    lastUpdate.value = new Date().toLocaleTimeString('id-ID');
    console.log('📊 Fetched users:', users.value.length);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const refreshUsers = () => {
  fetchUsers();
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (!socketConnected.value) {
      console.log('🔄 Auto refresh: Socket disconnected, fetching users...');
      fetchUsers();
    }
  }, 10000); // Every 10 seconds
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const updateUserStatus = (data: { 
  userId: string; 
  status?: 'online' | 'idle' | 'offline';
  isActive?: boolean;
  timestamp?: string;
}) => {
  const userIndex = users.value.findIndex(user => user._id === data.userId);
  if (userIndex !== -1) {
    // Handle both status and isActive fields
    if (data.status) {
      users.value[userIndex].status = data.status;
    } else if (data.isActive !== undefined) {
      users.value[userIndex].status = data.isActive ? 'online' : 'offline';
    }
    
    users.value[userIndex].updatedAt = data.timestamp || new Date().toISOString();
    lastUpdate.value = new Date().toLocaleTimeString('id-ID');
    console.log(`📊 Status updated: ${users.value[userIndex].name} is now ${users.value[userIndex].status}`);
  } else {
    // User not found in current list, refresh to get updated data
    console.log('👤 User not found in current list, refreshing...');
    fetchUsers();
  }
};

const forceOfflineUser = (userId: string) => {
  if (confirm('Apakah Anda yakin ingin memaksa user ini offline?')) {
    const socket = $socket.get();
    if (socket) {
      socket.emit('force-user-offline', userId);
      console.log(`🔴 Force offline request sent for user: ${userId}`);
      
      // Immediately update UI and refresh after a delay
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    }
  }
};

// Initialize admin socket connection
const initializeAdminSocket = async () => {
  try {
    // First, fetch current user data and set as online
    await fetchUserData();
    
    const adminUserId = getUserId();
    if (!adminUserId) {
      console.error('❌ No admin user ID available');
      return;
    }

    console.log('🔄 Initializing admin socket for user:', adminUserId);
    
    // Set admin user as online
    await $socket.setUserOnline(adminUserId);
    
    // Get socket instance for admin-specific listeners
    const socket = $socket.get();
    
    if (socket) {
      socketConnected.value = socket.connected;
      
      // Listen for connection status changes
      socket.on('connect', () => {
        socketConnected.value = true;
        console.log('✅ Admin socket connected');
        // Re-emit admin as active on reconnect
        if (adminUserId) {
          socket.emit('user-active', adminUserId);
        }
        // Refresh users when socket reconnects
        fetchUsers();
      });
      
      socket.on('disconnect', (reason) => {
        socketConnected.value = false;
        console.log('❌ Admin socket disconnected:', reason);
      });
      
      // Enhanced socket listeners with better error handling
      socket.on('status-update', (data) => {
        console.log('📡 Received status-update:', data);
        updateUserStatus(data);
      });
      
      socket.on('user-status-update', (data) => {
        console.log('📡 Received user-status-update:', data);
        updateUserStatus(data);
      });
      
      socket.on('user-online', (data) => {
        console.log('🟢 User came online:', data);
        updateUserStatus({ 
          userId: data.userId || data._id, 
          status: 'online',
          timestamp: data.timestamp
        });
      });
      
      socket.on('user-idle', (data) => {
        console.log('🟡 User went idle:', data);
        updateUserStatus({ 
          userId: data.userId || data._id, 
          status: 'idle',
          timestamp: data.timestamp
        });
      });
      
      socket.on('user-offline', (data) => {
        console.log('🔴 User went offline:', data);
        updateUserStatus({ 
          userId: data.userId || data._id, 
          status: 'offline',
          timestamp: data.timestamp
        });
      });

      // Listen for force offline confirmation
      socket.on('user-forced-offline', (data) => {
        console.log('💥 User forced offline:', data);
        updateUserStatus({ 
          userId: data.userId || data._id, 
          status: 'offline',
          timestamp: data.timestamp
        });
      });

      // Generic status change listener
      socket.on('status-changed', (data) => {
        console.log('🔄 Status changed:', data);
        updateUserStatus(data);
      });
      
      console.log('✅ Admin socket listeners registered');
    }
  } catch (error) {
    console.error('❌ Failed to initialize admin socket:', error);
  }
};

// Lifecycle
onMounted(async () => {
  console.log('🚀 Admin dashboard mounting...');
  
  // Fetch users first
  await fetchUsers();
  
  // Initialize socket connection for admin
  if (process.client && $socket) {
    await initializeAdminSocket();
  }
  
  // Start auto refresh if enabled
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  console.log('🔄 Admin dashboard unmounting...');
  
  // Stop auto refresh
  stopAutoRefresh();
  
  // Remove socket listeners
  if (process.client && $socket?.get()) {
    const socket = $socket.get();
    if (socket) {
      socket.off('user-status-update');
      socket.off('user-online');
      socket.off('user-idle');
      socket.off('user-offline');
      socket.off('user-forced-offline');
      socket.off('status-changed');
      console.log('✅ Admin socket listeners removed');
    }
  }
  
  // Set admin user offline
  const adminUserId = getUserId();
  if (adminUserId) {
    $socket.setUserOffline(adminUserId);
    console.log('🔴 Admin user set offline');
  }
});
</script>