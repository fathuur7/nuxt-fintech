import type { Database } from '~/lib/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export const useSupabaseTransactions = () => {
  const { supabase } = useSupabase()
  const { getCurrentUserId } = useSupabaseAuth()
  
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create a new transaction
  const createTransaction = async (transactionData: Omit<TransactionInsert, 'user_id'>) => {
    try {
      loading.value = true
      error.value = null
      
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: userId
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      console.error('Error creating transaction:', err)
      error.value = err instanceof Error ? err.message : 'Failed to create transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get user transactions with pagination
  const getUserTransactions = async (userId?: string, page: number = 1, limit: number = 10) => {
    try {
      loading.value = true
      error.value = null
      
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error('User not authenticated')
      }

      const offset = (page - 1) * limit

      const { data, error: fetchError, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) throw fetchError

      transactions.value = data || []
      
      return {
        transactions: data || [],
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
        total: count || 0
      }
    } catch (err) {
      console.error('Error fetching user transactions:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions'
      return {
        transactions: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      }
    } finally {
      loading.value = false
    }
  }

  // Update transaction status
  const updateTransactionStatus = async (orderId: string, status: 'pending' | 'success' | 'failed' | 'expired', additionalData?: Partial<Transaction>) => {
    try {
      const updateData = {
        status,
        ...additionalData
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('order_id', orderId)
        .select()
        .single()

      if (error) throw error

      // If transaction is successful and it's a topup, update user balance
      if (status === 'success' && data.type === 'topup') {
        await updateUserBalance(data.user_id, data.amount, 'add')
      }

      return data
    } catch (err) {
      console.error('Error updating transaction status:', err)
      throw err
    }
  }

  // Get transaction by order ID
  const getTransactionByOrderId = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, username, email)
        `)
        .eq('order_id', orderId)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching transaction by order ID:', err)
      throw err
    }
  }

  // Get user balance
  const getUserBalance = async (userId?: string) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, balance')
        .eq('id', targetUserId)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching user balance:', err)
      throw err
    }
  }

  return {
    transactions: readonly(transactions),
    loading: readonly(loading),
    error: readonly(error),
    createTransaction,
    getUserTransactions,
    updateTransactionStatus,
    getTransactionByOrderId,
    getUserBalance
  }
}