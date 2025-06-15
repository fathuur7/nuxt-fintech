// server/utils/savings.ts
export const generateAccountNumber = (): string => {
  return 'SAV' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
}

// types/savings.ts
export interface SavingsProduct {
  _id: string
  name: string
  interestRate: number
  minBalance: number
  maxBalance?: number
  compoundPeriod: 'daily' | 'monthly' | 'quarterly' | 'annually'
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SavingsAccount {
  _id: string
  userId: string
  productId: string | SavingsProduct
  accountNumber: string
  balance: number
  interestAccrued: number
  lastInterestCalculation: Date
  status: 'active' | 'dormant' | 'closed'
  openDate: Date
  closeDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SavingsTransaction {
  _id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'interest' | 'fee'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  reference?: string
  processedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface InterestCalculation {
  _id: string
  accountId: string
  calculationDate: Date
  principalAmount: number
  interestRate: number
  daysCalculated: number
  interestAmount: number
  status: 'calculated' | 'applied'
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

// composables/useSavings.ts
export const useSavings = () => {
  // Create product
  const createProduct = async (productData: Partial<SavingsProduct>) => {
    const { data } = await $fetch<ApiResponse<SavingsProduct>>('/api/savings/products', {
      method: 'POST',
      body: productData
    })
    return data
  }
  
  // Get all products
  const getProducts = async () => {
    const { data } = await $fetch<ApiResponse<SavingsProduct[]>>('/api/savings/products')
    return data
  }
  
  // Create account
  const createAccount = async (accountData: {
    userId: string
    productId: string
    initialDeposit?: number
  }) => {
    const { data } = await $fetch<ApiResponse<SavingsAccount>>('/api/savings/accounts', {
      method: 'POST',
      body: accountData
    })
    return data
  }
  
  // Get user accounts
  const getUserAccounts = async (userId: string) => {
    const { data } = await $fetch<ApiResponse<SavingsAccount[]>>(`/api/savings/accounts/user/${userId}`)
    return data
  }
  
  // Deposit
  const deposit = async (accountId: string, amount: number, description?: string) => {
    const { data } = await $fetch<ApiResponse>(`/api/savings/accounts/${accountId}/deposit`, {
      method: 'POST',
      body: { amount, description }
    })
    return data
  }
  
  // Withdraw
  const withdraw = async (accountId: string, amount: number, description?: string) => {
    const { data } = await $fetch<ApiResponse>(`/api/savings/accounts/${accountId}/withdraw`, {
      method: 'POST',
      body: { amount, description }
    })
    return data
  }
  
  // Calculate interest
  const calculateInterest = async () => {
    const { data } = await $fetch<ApiResponse>('/api/savings/calculate-interest', {
      method: 'POST'
    })
    return data
  }
  
  // Apply interest
  const applyInterest = async (accountId: string) => {
    const { data } = await $fetch<ApiResponse>(`/api/savings/accounts/${accountId}/apply-interest`, {
      method: 'POST'
    })
    return data
  }
  
  // Get account details
  const getAccountDetails = async (accountId: string) => {
    const { data } = await $fetch<ApiResponse<SavingsAccount>>(`/api/savings/accounts/${accountId}`)
    return data
  }
  
  // Get transactions
  const getTransactions = async (accountId: string, page = 1, limit = 20) => {
    const { data } = await $fetch<ApiResponse<{
      transactions: SavingsTransaction[]
      pagination: any
    }>>(`/api/savings/accounts/${accountId}/transactions?page=${page}&limit=${limit}`)
    return data
  }
  
  return {
    createProduct,
    getProducts,
    createAccount,
    getUserAccounts,
    deposit,
    withdraw,
    calculateInterest,
    applyInterest,
    getAccountDetails,
    getTransactions
  }
}