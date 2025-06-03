// composables/useUsers.ts
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import type { User } from '~/types/user'

export const useUsers = () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<string>('')

  const fetchUsers = async () => {
    try {
      loading.value = true
      const { data } = await $fetch('/api/user/getUser')
      users.value = (data || []).map((u: any) => ({
        _id: String(u._id),
        id: String(u.id ?? u._id), // ensure 'id' is present, fallback to _id if missing
        name: String(u.name),
        email: String(u.email),
        role: u.role === 'admin' ? 'admin' : 'user',
        balance: Number(u.balance),
        status: 'offline', // akan diperbarui oleh socket
        isActive: Boolean(u.isActive),
        picture: String(u.picture),
        createdAt: String(u.createdAt),
        updatedAt: String(u.updatedAt)
      }))
      lastUpdate.value = new Date().toLocaleTimeString('id-ID')
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = (userId: string, newStatus: 'online' | 'offline' | 'idle') => {
    const user = users.value.find(u => u._id === userId)
    if (user) {
      user.status = newStatus
    }
  }

  onMounted(() => {
    fetchUsers()

    const { $socket } = useNuxtApp()

    $socket.get()?.on('user-connected', (userId: string) => {
      console.log('🟢 user-connected:', userId)
      updateUserStatus(userId, 'online')
    })

    $socket.get()?.on('user-disconnected', (userId: string) => {
      console.log('🔴 user-disconnected:', userId)
      updateUserStatus(userId, 'offline')
    })
  })

  return {
    users,
    loading,
    error,
    fetchUsers
    
  }
}
