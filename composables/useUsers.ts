interface User {
  _id: string;
  status?: string;
  [key: string]: any;
}

export const useUsers = () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async () => {
    try {
  loading.value = true
  error.value = null

  const response = await $fetch('/api/user/getAllUser')
  console.log('Fetched response:', response)

  // Menangani format fleksibel
  if (Array.isArray(response)) {
    users.value = response
  } else if (response.success && response.data) {
    users.value = response.data
  } else {
    throw new Error(response.error || 'Failed to fetch users')
  }
} catch (err: any) {
  error.value = err.message
  console.error('Error fetching users:', err)
} finally {
  loading.value = false
}

  }

  const getUserById = (id: string) => {
    return users.value.find(user => user._id === id)
  }

  const getOnlineUsers = () => {
    return users.value.filter(user => user.status === 'online')
  }

  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    getUserById,
    getOnlineUsers
  }
}
