type UserType = {
  id: number
  name: string
  email: string
  picture: string
  balance: number
}

export const useProfile = () => {
  const user = ref<UserType | null>(null)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    try {
      const response = await useFetch('/api/user/profile', {    
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.error.value) {
        throw new Error(response.error.value.message)
      }

      user.value = response.data.value as UserType
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching the profile.'
    }
  }

  return { user, error, fetchProfile }
}
