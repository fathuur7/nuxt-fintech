import type { Database } from '~/lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']

export const useSupabaseProfile = () => {
  const { supabase } = useSupabase()
  const { getCurrentUserId } = useSupabaseAuth()
  
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUserProfile = async (userId?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error('No user ID available')
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      user.value = data
      return data
    } catch (err) {
      console.error('Error fetching user profile:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (updates: UserUpdate) => {
    try {
      loading.value = true
      error.value = null
      
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('No user ID available')
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      user.value = data
      return data
    } catch (err) {
      console.error('Error updating user profile:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (status: 'online' | 'offline' | 'idle', isActive?: boolean) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return null

      const updates: UserUpdate = {
        status,
        last_seen: new Date().toISOString()
      }

      if (isActive !== undefined) {
        updates.is_active = isActive
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user status:', updateError)
        return null
      }

      if (user.value) {
        user.value = { ...user.value, ...data }
      }

      return data
    } catch (err) {
      console.error('Error updating user status:', err)
      return null
    }
  }

  const getAllUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      return data
    } catch (err) {
      console.error('Error fetching all users:', err)
      return []
    }
  }

  const getAdminUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      return data
    } catch (err) {
      console.error('Error fetching admin users:', err)
      return []
    }
  }

  const updateUserBalance = async (userId: string, amount: number, operation: 'add' | 'subtract' = 'add') => {
    try {
      // First get current balance
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const currentBalance = currentUser.balance || 0
      const newBalance = operation === 'add' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount)

      const { data, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data
    } catch (err) {
      console.error('Error updating user balance:', err)
      throw err
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    fetchUserProfile,
    updateUserProfile,
    updateUserStatus,
    getAllUsers,
    getAdminUsers,
    updateUserBalance
  }
}