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
const { data, error, pending } = await useFetch<AdminResponse>('/api/user/getAdmin')

// GUNAKAN `computed` UNTUK MEMBUAT VARIABEL `users` YANG REAKTIF
const users = computed(() => {
  // Logika ini akan dijalankan ulang secara otomatis ketika `data.value` berubah
  if (data.value && data.value.success && Array.isArray(data.value.data)) {
    return data.value.data
  }
  // Selalu kembalikan array kosong jika data tidak valid atau belum ada
  return []
})

// console.log tidak akan menampilkan data final di sini karena sifat asinkron,
// gunakan Vue DevTools untuk memeriksa nilai `data` dan `users` secara reaktif.

const router = useRouter()
function navigateToChat(userId: string) {
  router.push(`chat/${userId}`)
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
  <div class="chat-container p-6">
    <h1 class="text-2xl font-bold mb-4">Chat</h1>
    <p class="mb-6">Select a user to start chatting.</p>

    <div v-if="pending">Loading users...</div>
    <div v-else-if="error">❌ {{ error.message || error }}</div>
    <div v-else>
      <ul class="space-y-2">
        <li
          v-for="user in users"
          :key="user._id"
          class="p-3 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
          @click="navigateToChat(user._id)"
        >
          {{ user.name || user.email || user._id }}
        </li>
      </ul>
    </div>
  </div>
</template>