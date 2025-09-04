import type { Database } from '~/lib/supabase'

type SavingsProduct = Database['public']['Tables']['savings_products']['Row']
type SavingsAccount = Database['public']['Tables']['savings_accounts']['Row']
type SavingsTransaction = Database['public']['Tables']['savings_transactions']['Row']
type SavingsAccountInsert = Database['public']['Tables']['savings_accounts']['Insert']
type SavingsTransactionInsert = Database['public']['Tables']['savings_transactions']['Insert']

export const useSupabaseSavings = () => {
  const { supabase } = useSupabase()
  const { getCurrentUserId } = useSupabaseAuth()
  const { updateUserBalance } = useSupabaseProfile()

  // Get all active savings products
  const getSavingsProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_products')
        .select('*')
        .eq('is_active', true)
        .order('interest_rate', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching savings products:', err)
      throw err
    }
  }

  // Create a new savings account
  const createSavingsAccount = async (productId: string, initialDeposit: number = 0) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Generate account number
      const { data: accountNumber, error: rpcError } = await supabase
        .rpc('generate_account_number')

      if (rpcError) throw rpcError

      const accountData: SavingsAccountInsert = {
        user_id: userId,
        product_id: productId,
        account_number: accountNumber,
        balance: initialDeposit,
        last_interest_calculation: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('savings_accounts')
        .insert(accountData)
        .select(`
          *,
          product:savings_products(*)
        `)
        .single()

      if (error) throw error

      // If there's an initial deposit, deduct from user balance and create transaction
      if (initialDeposit > 0) {
        await updateUserBalance(userId, initialDeposit, 'subtract')
        
        await supabase
          .from('savings_transactions')
          .insert({
            account_id: data.id,
            type: 'deposit',
            amount: initialDeposit,
            balance_before: 0,
            balance_after: initialDeposit,
            description: 'Initial deposit'
          })
      }

      return data
    } catch (err) {
      console.error('Error creating savings account:', err)
      throw err
    }
  }

  // Get user's savings accounts
  const getUserSavingsAccounts = async (userId?: string) => {
    try {
      const targetUserId = userId || getCurrentUserId()
      if (!targetUserId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('savings_accounts')
        .select(`
          *,
          product:savings_products(*)
        `)
        .eq('user_id', targetUserId)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching user savings accounts:', err)
      throw err
    }
  }

  // Get account details with calculated interest
  const getSavingsAccountDetails = async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select(`
          *,
          product:savings_products(*),
          user:users(id, username, email)
        `)
        .eq('id', accountId)
        .single()

      if (error) throw error

      // Calculate potential interest
      const now = new Date()
      const lastCalculation = new Date(data.last_interest_calculation)
      const minutesDiff = Math.floor((now.getTime() - lastCalculation.getTime()) / (1000 * 60))
      
      let potentialInterest = 0
      if (minutesDiff >= 1 && data.product) {
        const { data: calculatedInterest, error: calcError } = await supabase
          .rpc('calculate_account_interest', {
            account_uuid: accountId,
            minutes_passed: minutesDiff
          })

        if (!calcError) {
          potentialInterest = calculatedInterest || 0
        }
      }

      return {
        ...data,
        potentialInterest,
        minutesSinceLastCalculation: minutesDiff,
        totalAccruedInterest: data.interest_accrued + potentialInterest
      }
    } catch (err) {
      console.error('Error fetching account details:', err)
      throw err
    }
  }

  // Deposit to savings account
  const depositToSavings = async (accountId: string, amount: number, description: string = 'Deposit') => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get current account and user data
      const [accountResult, userResult] = await Promise.all([
        supabase.from('savings_accounts').select('*, product:savings_products(*)').eq('id', accountId).single(),
        supabase.from('users').select('balance').eq('id', userId).single()
      ])

      if (accountResult.error) throw accountResult.error
      if (userResult.error) throw userResult.error

      const account = accountResult.data
      const user = userResult.data

      // Validate user has sufficient balance
      if (user.balance < amount) {
        throw new Error('Insufficient user balance for deposit')
      }

      // Check maximum balance limit
      if (account.product.max_balance && (account.balance + amount) > account.product.max_balance) {
        throw new Error(`Maximum balance exceeded. Max: ${account.product.max_balance}`)
      }

      const balanceBefore = account.balance
      const balanceAfter = account.balance + amount

      // Update savings account balance
      const { error: updateAccountError } = await supabase
        .from('savings_accounts')
        .update({ balance: balanceAfter })
        .eq('id', accountId)

      if (updateAccountError) throw updateAccountError

      // Update user balance
      await updateUserBalance(userId, amount, 'subtract')

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('savings_transactions')
        .insert({
          account_id: accountId,
          type: 'deposit',
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
          processed_by: userId
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      return {
        success: true,
        data: {
          accountId,
          balanceBefore,
          balanceAfter,
          depositAmount: amount,
          transaction
        }
      }
    } catch (err) {
      console.error('Error depositing to savings:', err)
      throw err
    }
  }

  // Withdraw from savings account
  const withdrawFromSavings = async (accountId: string, amount: number, description: string = 'Withdrawal') => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get current account data
      const { data: account, error: accountError } = await supabase
        .from('savings_accounts')
        .select('*, product:savings_products(*)')
        .eq('id', accountId)
        .single()

      if (accountError) throw accountError

      // Validate withdrawal
      if (account.balance < amount) {
        throw new Error('Insufficient savings account balance')
      }

      const balanceAfter = account.balance - amount
      if (balanceAfter < account.product.min_balance) {
        throw new Error(`Minimum balance required: ${account.product.min_balance}`)
      }

      const balanceBefore = account.balance

      // Update savings account balance
      const { error: updateAccountError } = await supabase
        .from('savings_accounts')
        .update({ balance: balanceAfter })
        .eq('id', accountId)

      if (updateAccountError) throw updateAccountError

      // Update user balance (add withdrawn amount)
      await updateUserBalance(userId, amount, 'add')

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('savings_transactions')
        .insert({
          account_id: accountId,
          type: 'withdrawal',
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description,
          processed_by: userId
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      return {
        success: true,
        data: {
          accountId,
          balanceBefore,
          balanceAfter,
          withdrawalAmount: amount,
          transaction
        }
      }
    } catch (err) {
      console.error('Error withdrawing from savings:', err)
      throw err
    }
  }

  // Calculate and apply interest to account
  const calculateAndApplyInterest = async (accountId: string) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('savings_accounts')
        .select('*, product:savings_products(*)')
        .eq('id', accountId)
        .single()

      if (accountError) throw accountError

      // Calculate minutes since last calculation
      const now = new Date()
      const lastCalculation = new Date(account.last_interest_calculation)
      const minutesDiff = Math.floor((now.getTime() - lastCalculation.getTime()) / (1000 * 60))

      if (minutesDiff < 1) {
        throw new Error('Insufficient time passed for interest calculation')
      }

      // Calculate new interest
      const { data: newInterest, error: calcError } = await supabase
        .rpc('calculate_account_interest', {
          account_uuid: accountId,
          minutes_passed: minutesDiff
        })

      if (calcError) throw calcError

      const interestAmount = newInterest || 0
      const totalInterestToApply = account.interest_accrued + interestAmount

      if (totalInterestToApply <= 0) {
        throw new Error('No interest available to apply')
      }

      const balanceBefore = account.balance
      const balanceAfter = account.balance + totalInterestToApply

      // Update account with new balance and reset accrued interest
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({
          balance: balanceAfter,
          interest_accrued: 0,
          last_interest_calculation: now.toISOString()
        })
        .eq('id', accountId)

      if (updateError) throw updateError

      // Create interest transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('savings_transactions')
        .insert({
          account_id: accountId,
          type: 'interest',
          amount: totalInterestToApply,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: `Interest applied (${minutesDiff} minutes accumulated)`,
          processed_by: userId
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Log interest calculation
      const { error: logError } = await supabase
        .from('interest_calculations')
        .insert({
          account_id: accountId,
          calculation_date: now.toISOString(),
          principal_amount: balanceBefore,
          interest_rate: account.product.interest_rate,
          days_calculated: minutesDiff / (24 * 60),
          interest_amount: totalInterestToApply,
          status: 'applied'
        })

      if (logError) console.warn('Error logging interest calculation:', logError)

      return {
        success: true,
        data: {
          accountId,
          balanceBefore,
          balanceAfter,
          interestApplied: totalInterestToApply,
          minutesSinceLast: minutesDiff,
          transaction
        }
      }
    } catch (err) {
      console.error('Error calculating and applying interest:', err)
      throw err
    }
  }

  // Get savings transactions
  const getSavingsTransactions = async (accountId: string, limit: number = 20, offset: number = 0) => {
    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .select(`
          *,
          processed_by_user:users!processed_by(username, email)
        `)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching savings transactions:', err)
      throw err
    }
  }

  return {
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    getSavingsProducts,
    createSavingsAccount,
    getUserSavingsAccounts,
    getSavingsAccountDetails,
    depositToSavings,
    withdrawFromSavings,
    calculateAndApplyInterest,
    getSavingsTransactions
  }
}