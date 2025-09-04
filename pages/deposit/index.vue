<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Savings Account</h1>
        <p class="text-gray-600">Manage your deposits, withdrawals, and interest</p>
      </div>

      <!-- Interest Management Section (Admin/Manager Only) -->
      <div v-if="canManageInterest" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Interest Management</h2>
        <div class="flex space-x-4">
          <button
            @click="calculateInterestForAll"
            :disabled="processingInterest"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <span v-if="processingInterest" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Calculating...
            </span>
            <span v-else>Calculate Interest for All Accounts</span>
          </button>
          
          <button
            v-if="selectedAccount"
            @click="applyInterestToAccount"
            :disabled="processingInterest"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <span v-if="processingInterest" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Applying...
            </span>
            <span v-else>Apply Interest to Selected Account</span>
          </button>
        </div>
        
        <!-- Interest Calculation Results -->
        <div v-if="interestCalculationResults" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">Interest Calculation Results</h3>
          <div class="text-sm text-blue-700">
            <p>Total Accounts Processed: {{ interestCalculationResults.totalProcessed || 0 }}</p>
            <p>Total Interest Calculated: Rp {{ formatCurrency(interestCalculationResults.totalInterest || 0) }}</p>
            <p>Calculated At: {{ formatDate(interestCalculationResults.calculatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Account Selection -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Select Account</h2>
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading accounts...</p>
        </div>
        <div v-else-if="!userReady" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading user profile...</p>
        </div>
        <div v-else-if="accounts.length === 0" class="text-center py-4">
          <p class="text-gray-600">No savings accounts found</p>
        </div>
        <div v-else class="grid gap-4">
          <div 
            v-for="account in accounts" 
            :key="account._id"
            @click="selectAccount(account)"
            :class="[
              'p-4 border rounded-lg cursor-pointer transition-colors',
              selectedAccount?._id === account._id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ account.accountNumber }}</h3>
                <p class="text-sm text-gray-600">
                  {{ typeof account.productId === 'object' ? account.productId.name : 'Savings Account' }}
                </p>
                <!-- Interest Rate Display -->
                <p v-if="account.productId?.interestRate" class="text-sm text-blue-600">
                  Interest Rate: {{ account.productId.interestRate }}% per annum
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">
                  Rp {{ formatCurrency(account.balance) }}
                </p>
                <p class="text-sm text-gray-500">
                  Status: {{ account.status }}
                </p>
                <!-- Last Interest Date -->
                <p v-if="account.lastInterestDate" class="text-xs text-blue-500">
                  Last Interest: {{ formatDate(account.lastInterestDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Form -->
      <div v-if="selectedAccount" class="bg-white rounded-lg shadow-md p-6">
        <div class="flex space-x-4 mb-6">
          <button 
            @click="transactionType = 'deposit'"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition-colors',
              transactionType === 'deposit' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Deposit
          </button>
          <button 
            @click="transactionType = 'withdraw'"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition-colors',
              transactionType === 'withdraw' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Withdraw
          </button>
        </div>

        <form @submit.prevent="submitTransaction" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Amount (Rp)
            </label>
            <input
              v-model.number="amount"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              v-model="description"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description"
            />
          </div>

          <!-- Validation Messages -->
          <div v-if="validationError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ validationError }}
          </div>

          <!-- Current Balance Info -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Current Balance:</span>
              <span class="font-semibold">Rp {{ formatCurrency(selectedAccount.balance) }}</span>
            </div>
            <div v-if="transactionType === 'withdraw' && amount" class="flex justify-between items-center mt-2">
              <span class="text-gray-600">Balance After Withdrawal:</span>
              <span :class="[
                'font-semibold',
                (selectedAccount.balance - amount) >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                Rp {{ formatCurrency(selectedAccount.balance - amount) }}
              </span>
            </div>
            <!-- Interest Information -->
            <div v-if="selectedAccount.productId?.interestRate" class="mt-2 pt-2 border-t border-gray-200">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Monthly Interest (Est.):</span>
                <span class="text-blue-600">
                  Rp {{ formatCurrency(calculateMonthlyInterest(selectedAccount)) }}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="processing || !amount || amount <= 0"
            :class="[
              'w-full py-3 px-4 rounded-lg font-medium transition-colors',
              processing || !amount || amount <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : transactionType === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
            ]"
          >
            <span v-if="processing" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
            <span v-else>
              {{ transactionType === 'deposit' ? 'Deposit' : 'Withdraw' }} 
              Rp {{ formatCurrency(amount || 0) }}
            </span>
          </button>
        </form>
      </div>

      <!-- Recent Transactions -->
      <div v-if="selectedAccount && transactions.length > 0" class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 class="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div class="space-y-3">
          <div 
            v-for="transaction in transactions" 
            :key="transaction._id"
            class="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <div class="flex items-center space-x-2">
                <span :class="[
                  'px-2 py-1 text-xs rounded font-medium',
                  transaction.type === 'deposit' 
                    ? 'bg-green-100 text-green-800'
                    : transaction.type === 'withdrawal'
                      ? 'bg-red-100 text-red-800'
                      : transaction.type === 'interest'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                ]">
                  {{ transaction.type.toUpperCase() }}
                </span>
                <!-- Interest Badge -->
                <span v-if="transaction.type === 'interest'" class="px-2 py-1 text-xs rounded font-medium bg-yellow-100 text-yellow-800">
                  AUTO
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ transaction.description || 'No description' }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>
            <div class="text-right">
              <p :class="[
                'font-semibold',
                transaction.type === 'deposit' || transaction.type === 'interest'
                  ? 'text-green-600'
                  : 'text-red-600'
              ]">
                {{ transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-' }}
                Rp {{ formatCurrency(transaction.amount) }}
              </p>
              <p class="text-xs text-gray-500">
                Balance: Rp {{ formatCurrency(transaction.balanceAfter) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div :class="[
            'mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4',
            lastTransaction?.type === 'deposit' ? 'bg-green-100' : 
            lastTransaction?.type === 'interest' ? 'bg-blue-100' : 'bg-red-100'
          ]">
            <svg :class="[
              'h-6 w-6',
              lastTransaction?.type === 'deposit' ? 'text-green-600' : 
              lastTransaction?.type === 'interest' ? 'text-blue-600' : 'text-red-600'
            ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ lastTransaction?.type === 'interest' ? 'Interest Applied' : 'Transaction Successful' }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            {{ lastTransaction?.type === 'deposit' ? 'Deposit' : 
                lastTransaction?.type === 'interest' ? 'Interest' : 'Withdrawal' }} of 
            Rp {{ formatCurrency(lastTransaction?.amount || 0) }} completed successfully.
          </p>
          <button
            @click="showSuccessModal = false"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="errorMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p class="text-sm text-gray-600 mb-4">{{ errorMessage }}</p>
          <button
            @click="errorMessage = null"
            class="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Interest Application Modal -->
    <div v-if="showInterestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Interest Calculation Complete</h3>
          <div class="text-sm text-gray-600 mb-4">
            <p v-if="interestCalculationResults">
              Successfully processed {{ interestCalculationResults.totalProcessed }} accounts.
            </p>
            <p v-if="interestCalculationResults">
              Total interest calculated: Rp {{ formatCurrency(interestCalculationResults.totalInterest) }}
            </p>
          </div>
          <button
            @click="showInterestModal = false"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'

// Composables
const { getUserId, getUserRole } = useProfile()
const { updatePresence } = useSupabaseRealtime()
const { 
  getUserAccounts,
  deposit,
  withdraw,
  getTransactions,
  applyInterest
} = useSavings()

// Reactive data
const accounts = ref([])
const selectedAccount = ref(null)
const transactions = ref([])
const transactionType = ref('deposit')
const amount = ref(null)
const description = ref('')
const loading = ref(false)
const processing = ref(false)
const processingInterest = ref(false)
const showSuccessModal = ref(false)
const showInterestModal = ref(false)
const lastTransaction = ref(null)
const errorMessage = ref(null)
const userReady = ref(false)
const interestCalculationResults = ref(null)

// Set user online in presence
onMounted(async () => {
  const userId = getUserId()
  if (userId) {
    await updatePresence('online')
  }
})

// Set user offline in presence when component is unmounted
onUnmounted(() => {
  updatePresence('offline').catch(console.error)
})
// Computed
const validationError = computed(() => {
  if (!amount.value || amount.value <= 0) return null
  
  if (transactionType.value === 'withdraw') {
    const minBalance = typeof selectedAccount.value?.product === 'object' 
      ? selectedAccount.value.product.min_balance || 0 
      : 0
    
    if (selectedAccount.value && (selectedAccount.value.balance - amount.value) < minBalance) {
      return `Insufficient balance. Minimum balance required: Rp ${formatCurrency(minBalance)}`
    }
  }
  
  return null
})

// Check if user can manage interest (admin/manager role)
const canManageInterest = computed(() => {
  const userRole = getUserRole() || 'user'
  return ['admin', 'manager', 'staff'].includes(userRole.toLowerCase())
})

// Methods
const loadAccounts = async () => {
  try {
    loading.value = true
    const userId = getUserId()
    
    if (!userId) {
      console.warn('User ID not available yet')
      return
    }
    
    const accountsData = await getUserAccounts(userId)
    accounts.value = accountsData || []
    
    // Auto-select first active account
    if (accounts.value.length > 0) {
      const activeAccount = accounts.value.find(acc => acc.status === 'active')
      if (activeAccount) {
        selectAccount(activeAccount)
      }
    }
  } catch (error) {
    console.error('Error loading accounts:', error)
    errorMessage.value = 'Failed to load accounts. Please try again.'
  } finally {
    loading.value = false
  }
}

const selectAccount = async (account) => {
  selectedAccount.value = account
  await loadTransactions()
}

const loadTransactions = async () => {
  if (!selectedAccount.value) return
  
  try {
    const data = await getTransactions(selectedAccount.value.id, 1, 10)
    transactions.value = data?.transactions || []
  } catch (error) {
    console.error('Error loading transactions:', error)
  }
}

const submitTransaction = async () => {
  if (validationError.value || !selectedAccount.value || !amount.value) return
  
  try {
    processing.value = true
    
    let result
    if (transactionType.value === 'deposit') {
      result = await deposit(selectedAccount.value.id, amount.value, description.value)
    } else {
      result = await withdraw(selectedAccount.value.id, amount.value, description.value)
    }
    
    // Update account balance (assuming the API returns updated account info)
    if (transactionType.value === 'deposit') {
      selectedAccount.value.balance += amount.value
    } else {
      selectedAccount.value.balance -= amount.value
    }
    
    // Store transaction info for modal
    lastTransaction.value = {
      type: transactionType.value,
      amount: amount.value
    }
    
    // Reset form
    amount.value = null
    description.value = ''
    
    // Reload transactions
    await loadTransactions()
    
    // Show success modal
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Transaction error:', error)
    errorMessage.value = 'Transaction failed. Please try again.'
  } finally {
    processing.value = false
  }
}

const applyInterestToAccount = async () => {
  if (!selectedAccount.value) return
  
  try {
    processingInterest.value = true
    const result = await applyInterest(selectedAccount.value.id)
    
    // Update account balance
    selectedAccount.value.balance = result.data?.balanceAfter || selectedAccount.value.balance
    
    // Store interest info for modal
    lastTransaction.value = {
      type: 'interest',
      amount: result.data?.interestApplied || 0
    }
    
    // Reload transactions and accounts
    await loadTransactions()
    await loadAccounts()
    
    // Show success modal
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Error applying interest:', error)
    errorMessage.value = 'Failed to apply interest. Please try again.'
  } finally {
    processingInterest.value = false
  }
}

// Helper method to calculate estimated monthly interest
const calculateMonthlyInterest = (account) => {
  if (!account?.product?.interest_rate || !account.balance) return 0
  const annualRate = account.product.interest_rate / 100
  const monthlyRate = annualRate / 12
  return account.balance * monthlyRate
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for user readiness
const initializeWhenReady = async () => {
  // Check if getUserId returns a valid ID
  const userId = getUserId()
  userReady.value = Boolean(userId && userId !== 'null' && userId !== null)
  
  if (userReady.value) {
    await loadAccounts()
  }
}

// Watch for changes in user readiness
watch(
  () => getUserId(), 
  async (newUserId) => {
    if (newUserId && newUserId !== 'null') {
      userReady.value = true
      await loadAccounts()
    }
  }, 
  { immediate: true }
)

// Lifecycle
onMounted(async () => {
  // Wait a tick to ensure composables are initialized
  await nextTick()
  await initializeWhenReady()
  
  // If user still not ready, set up polling (fallback)
  if (!userReady.value) {
    const checkInterval = setInterval(async () => {
      const userId = getUserId()
      if (userId && userId !== 'null') {
        userReady.value = true
        clearInterval(checkInterval)
        await loadAccounts()
      }
    }, 100) // Check every 100ms
    
    // Clear interval after 10 seconds to prevent infinite polling
    setTimeout(() => {
      clearInterval(checkInterval)
      if (!userReady.value) {
        errorMessage.value = 'Unable to load user profile. Please refresh the page.'
      }
    }, 10000)
  }
})

// Meta
definePageMeta({
  title: 'Savings - Deposit & Withdraw',
  requiresAuth: true
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>