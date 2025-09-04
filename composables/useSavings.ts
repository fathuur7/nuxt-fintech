import type { Database } from '~/lib/supabase'
type SavingsProduct = Database['public']['Tables']['savings_products']['Row']
type SavingsAccount = Database['public']['Tables']['savings_accounts']['Row']
type SavingsTransaction = Database['public']['Tables']['savings_transactions']['Row']
export const useSavings = () => {
  const { 
    getSavingsProducts,
    createSavingsAccount,
    getUserSavingsAccounts,
    getSavingsAccountDetails,
    depositToSavings,
    withdrawFromSavings,
    calculateAndApplyInterest,
    getSavingsTransactions
  } = useSupabaseSavings()
  // Get all products
  const getProducts = async () => {
    try {
      return await getSavingsProducts()
    } catch (error) {
      console.error('Error getting products:', error)
      throw error
    }
  }
  
  // Create account
  const createAccount = async (accountData: {
    productId: string
    initialDeposit?: number
  }) => {
    try {
      return await createSavingsAccount(accountData.productId, accountData.initialDeposit)
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  }
  
  // Get user accounts
  const getUserAccounts = async (userId: string) => {
    try {
      return await getUserSavingsAccounts(userId)
    } catch (error) {
      console.error('Error getting user accounts:', error)
      throw error
    }
  }
  
  // Deposit
  const deposit = async (accountId: string, amount: number, description?: string) => {
    try {
      return await depositToSavings(accountId, amount, description)
    } catch (error) {
      console.error('Error making deposit:', error)
      throw error
    }
  }
  
  // Withdraw
  const withdraw = async (accountId: string, amount: number, description?: string) => {
    try {
      return await withdrawFromSavings(accountId, amount, description)
    } catch (error) {
      console.error('Error making withdrawal:', error)
      throw error
    }
  }
  
  // Apply interest
  const applyInterest = async (accountId: string) => {
    try {
      return await calculateAndApplyInterest(accountId)
    } catch (error) {
      console.error('Error applying interest:', error)
      throw error
    }
  }
  
  // Get account details
  const getAccountDetails = async (accountId: string) => {
    try {
      return await getSavingsAccountDetails(accountId)
    } catch (error) {
      console.error('Error getting account details:', error)
      throw error
    }
  }
  
  // Get transactions
  const getTransactions = async (accountId: string, page = 1, limit = 20) => {
    try {
      const offset = (page - 1) * limit
      const transactions = await getSavingsTransactions(accountId, limit, offset)
      
      return {
        transactions,
        pagination: {
          page,
          limit,
          total: transactions?.length || 0
        }
      }
    } catch (error) {
      console.error('Error getting transactions:', error)
      throw error
    }
  }
  
  return {
    getProducts,
    createAccount,
    getUserAccounts,
    deposit,
    withdraw,
    applyInterest,
    getAccountDetails,
    getTransactions
  }
}