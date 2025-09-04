<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  title: 'Chat',
  middleware: 'auth'
});

// Definisikan tipe data untuk pengguna agar lebih aman
interface User {
  _id: string;
  name?: string;
  email?: string;
  // tambahkan properti lain jika ada
}

interface AdminResponse {
  success: boolean;
  data: User[];
}

// Lakukan fetch data. `await` di sini akan membuat halaman tidak ditampilkan
// sampai data selesai diambil (saat server-side rendering).
const { getAdminUsers } = useSupabaseProfile()
const { data, error, pending } = await useLazyAsyncData('admin-users', () => getAdminUsers())

// GUNAKAN `computed` UNTUK MEMBUAT VARIABEL `users` YANG REAKTIF
const users = computed(() => {
  // Logika ini akan dijalankan ulang secara otomatis ketika `data.value` berubah
  if (data.value && Array.isArray(data.value)) {
    return data.value
  }
  // Selalu kembalikan array kosong jika data tidak valid atau belum ada
  return []
})

// console.log tidak akan menampilkan data final di sini karena sifat asinkron,
// gunakan Vue DevTools untuk memeriksa nilai `data` dan `users` secara reaktif.

const router = useRouter()
function navigateToChat(userId: string) {
  router.push(`/chat/${userId}`)
}

const { fetchUserData, getUserId } = useProfile();
const { $socket } = useNuxtApp()
// Login dan set online
onMounted(async () => {
  await fetchUserData()
  
  // Set user online after data is fetched
  const userId = getUserId()
  if (userId) {
    console.log('🔄 Initializing socket for user:', userId)
    await $socket.setUserOnline(userId)
  } else {
    console.error('❌ No user ID available for socket connection')
  }
})

// Set user offline when component is unmounted
onUnmounted(() => {
  const userId = getUserId()
  if (userId) {
    $socket.setUserOffline(userId)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="container mx-auto px-4 py-8 max-w-4xl">

        <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
      <!-- Header Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Chat Hub</h1>
        <p class="text-gray-600 text-lg">Connect with users and start meaningful conversations</p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="bg-white rounded-lg shadow-md p-8 text-center max-w-sm mx-auto">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg shadow-md p-8 text-center max-w-sm mx-auto">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-red-700 font-medium">{{ error.message || error }}</p>
        </div>
      </div>

      <!-- Users List -->
      <div v-else class="space-y-4">
        <!-- Empty State -->
        <div v-if="users.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No Users Available</h3>
          <p class="text-gray-500">There are no users to chat with at the moment.</p>
        </div>

        <!-- Users Grid -->
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="user in users"
            :key="user._id"
            class="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden"
            @click="navigateToChat(user._id)"
          >
            <div class="p-6">
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {{ (user.name || user.email || 'U').charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-200">
                    {{ user.name || 'Anonymous User' }}
                  </h3>
                  <p class="text-sm text-gray-500 truncate">
                    {{ user.email || user._id }}
                  </p>
                </div>

                <!-- Arrow Icon -->
                <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>

              <!-- Online Status Indicator -->
              <div class="mt-4 flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-xs text-gray-500">Click to start chat</span>
              </div>
            </div>

            <!-- Hover Effect Bottom Border -->
            <div class="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>