<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">💰 Savings Account Tracking</h1>
        <p class="text-gray-300 text-lg">Monitor your savings accounts and real-time interest calculations</p>
      </div>

      <!-- Debug Info (Remove in production) -->
      <div class="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
        <h3 class="font-medium text-yellow-400 mb-2">🔧 Debug Info:</h3>
        <div class="text-sm text-yellow-300 space-y-1">
          <p>User ID: <span class="font-mono">{{ debugUserId }}</span></p>
          <p>Accounts Count: <span class="font-mono">{{ userAccounts.length }}</span></p>
          <p>Selected Account: <span class="font-mono">{{ selectedAccountId }}</span></p>
          <p>Error: <span class="font-mono">{{ errorMessage }}</span></p>
        </div>
      </div>

      <!-- User Accounts Overview -->
      <div class="mb-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-white flex items-center gap-2">
              🏦 Your Savings Accounts
            </h2>
            <button 
              @click="refreshUserAccounts"
              :disabled="loadingUserAccounts"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              <span v-if="loadingUserAccounts" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                Refreshing...
              </span>
              <span v-else class="flex items-center gap-2">
                🔄 Refresh
              </span>
            </button>
          </div>

          <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl backdrop-blur-sm">
            <p class="text-red-300">❌ Error: {{ errorMessage }}</p>
          </div>

          <div v-if="loadingUserAccounts" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          </div>

          <div v-else-if="userAccounts.length === 0" class="text-center py-12 text-gray-300">
            <div class="text-6xl mb-4">🏦</div>
            <p class="text-xl">No active savings accounts found</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="account in userAccounts" 
              :key="account._id"
              class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              @click="selectAccount(account._id)"
              :class="{ 'ring-2 ring-blue-400 bg-white/20': selectedAccountId === account._id }"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-semibold text-white text-lg group-hover:text-blue-300 transition-colors">
                  {{ account.productId?.name || 'Savings Account' }}
                </h3>
                <span class="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                  ✅ {{ account.status }}
                </span>
              </div>
              <div class="text-gray-300 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm">Balance:</span>
                  <span class="font-bold text-white text-lg">Rp {{ formatCurrency(account.balance) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Interest Rate:</span>
                  <span class="font-semibold text-blue-300">{{ account.productId?.interestRate || 0 }}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Accrued Interest:</span>
                  <span class="font-semibold text-green-300">Rp {{ formatCurrency(account.interestAccrued) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Account Details -->
      <div v-if="selectedAccountId" class="mb-8">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-white flex items-center gap-2">
              📊 Account Details & Real-time Tracking
            </h2>
            <div class="flex gap-3">
              <button 
                @click="toggleAutoRefresh"
                :class="autoRefresh ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'"
                class="px-4 py-2 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg"
              >
                {{ autoRefresh ? '🟢' : '🔴' }} Auto Refresh: {{ autoRefresh ? 'ON' : 'OFF' }}
              </button>
              <button 
                @click="refreshAccountDetails"
                :disabled="loadingAccountDetails"
                class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                <span v-if="loadingAccountDetails" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  Loading...
                </span>
                <span v-else>🔄 Refresh</span>
              </button>
            </div>
          </div>

          <div v-if="loadingAccountDetails && !accountDetails" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          </div>

          <div v-else-if="accountDetails" class="space-y-8">
            <!-- Account Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                <h3 class="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                  💰 Current Balance
                </h3>
                <p class="text-3xl font-bold text-white">Rp {{ formatCurrency(accountDetails.balance) }}</p>
              </div>
              <div class="bg-gradient-to-br from-green-500/20 to-emerald-600/10 p-6 rounded-xl border border-green-500/30 backdrop-blur-sm">
                <h3 class="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                  📈 Accrued Interest
                </h3>
                <p class="text-3xl font-bold text-white">Rp {{ formatCurrency(accountDetails.interestAccrued) }}</p>
              </div>
              <div class="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 p-6 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
                <h3 class="text-sm font-medium text-yellow-300 mb-2 flex items-center gap-2">
                  ⚡ Potential Interest
                </h3>
                <p class="text-3xl font-bold text-white">Rp {{ formatCurrency(accountDetails.potentialInterest) }}</p>
              </div>
              <div class="bg-gradient-to-br from-purple-500/20 to-pink-600/10 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                <h3 class="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                  🎯 Total Interest
                </h3>
                <p class="text-3xl font-bold text-white">Rp {{ formatCurrency(accountDetails.totalAccruedInterest) }}</p>
              </div>
            </div>

            <!-- Real-time Stats -->
            <div class="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                ⏱️ Real-time Statistics
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-300 mb-1">{{ accountDetails.minutesSinceLastCalculation }}</div>
                  <div class="text-sm text-gray-300">Minutes since last calculation</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-300 mb-1">{{ accountDetails.productId?.interestRate || 0 }}%</div>
                  <div class="text-sm text-gray-300">Interest Rate (per year)</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-medium text-yellow-300 mb-1">{{ formatDateTime(accountDetails.lastInterestCalculation) }}</div>
                  <div class="text-sm text-gray-300">Last updated</div>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                ℹ️ Product Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-300">Product Name:</span>
                    <span class="font-medium text-white">{{ accountDetails.productId?.name || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-300">Account Status:</span>
                    <span class="font-medium text-green-300 capitalize">{{ accountDetails.status }}</span>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-300">Account Created:</span>
                    <span class="font-medium text-white text-sm">{{ formatDateTime(accountDetails.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-300">Last Modified:</span>
                    <span class="font-medium text-white text-sm">{{ formatDateTime(accountDetails.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-300">
            <div class="text-6xl mb-4">📊</div>
            <p class="text-xl">Select an account to view details</p>
          </div>
        </div>
      </div>

      <!-- Auto Refresh Status -->
      <div v-if="autoRefresh" class="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="animate-pulse w-3 h-3 bg-white rounded-full"></div>
          <span class="font-medium">Auto refreshing every 30s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchUserData, getUserId } = useProfile();
const { $socket } = useNuxtApp()

// Reactive data
const userAccounts = ref([])
const accountDetails = ref(null)
const selectedAccountId = ref(null)
const loadingUserAccounts = ref(false)
const loadingAccountDetails = ref(false)
const autoRefresh = ref(false)
const refreshInterval = ref(null)
const errorMessage = ref('')
const debugUserId = ref('')

// Fetch user accounts
const fetchUserAccounts = async () => {
  try {
    loadingUserAccounts.value = true
    errorMessage.value = ''
    
    const userId = getUserId()
    debugUserId.value = userId // For debugging
    
    if (!userId) {
      errorMessage.value = 'No user ID available'
      console.error('No user ID available')
      return
    }

    console.log('Fetching accounts for user:', userId)
    
    // Fixed: Direct fetch without expecting nested data structure
    const response = await $fetch(`/api/savings/accounts/user/${userId}`)
    
    console.log('API Response:', response)
    
    // Handle the response structure correctly
    if (response && response.success && response.data) {
      userAccounts.value = response.data
      console.log('Accounts loaded:', userAccounts.value.length)
    } else {
      errorMessage.value = 'Failed to load accounts: Invalid response structure'
      console.error('Invalid response structure:', response)
    }
  } catch (error) {
    console.error('Error fetching user accounts:', error)
    errorMessage.value = `Error: ${error.message || 'Failed to fetch accounts'}`
    
    // More detailed error logging
    if (error.response) {
      console.error('Error response:', error.response)
      errorMessage.value += ` (Status: ${error.response.status})`
    }
  } finally {
    loadingUserAccounts.value = false
  }
}

// Fetch account details
const fetchAccountDetails = async (accountId) => {
  try {
    loadingAccountDetails.value = true
    errorMessage.value = ''
    
    console.log('Fetching details for account:', accountId)
    
    const response = await $fetch(`/api/savings/accounts/${accountId}`)
    
    console.log('Account details response:', response)
    
    // Handle the response structure correctly
    if (response && response.success && response.data) {
      accountDetails.value = response.data
      console.log('Account details loaded:', accountDetails.value)
    } else {
      errorMessage.value = 'Failed to load account details'
      console.error('Invalid account details response:', response)
    }
  } catch (error) {
    console.error('Error fetching account details:', error)
    errorMessage.value = `Error loading account details: ${error.message || 'Unknown error'}`
  } finally {
    loadingAccountDetails.value = false
  }
}

// Select account
const selectAccount = (accountId) => {
  console.log('Selecting account:', accountId)
  selectedAccountId.value = accountId
  fetchAccountDetails(accountId)
}

// Refresh functions
const refreshUserAccounts = () => {
  console.log('Refreshing user accounts')
  fetchUserAccounts()
}

const refreshAccountDetails = () => {
  if (selectedAccountId.value) {
    console.log('Refreshing account details')
    fetchAccountDetails(selectedAccountId.value)
  }
}

// Auto refresh toggle
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    console.log('Starting auto refresh')
    // Start auto refresh every 30 seconds
    refreshInterval.value = setInterval(() => {
      if (selectedAccountId.value) {
        fetchAccountDetails(selectedAccountId.value)
      }
      fetchUserAccounts()
    }, 30000)
  } else {
    console.log('Stopping auto refresh')
    // Stop auto refresh
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle hooks
onMounted(async () => {
  console.log('Component mounted, initializing...')
  
  try {
    await fetchUserData()
    
    // Set user online after data is fetched
    const userId = getUserId()
    debugUserId.value = userId
    
    if (userId) {
      console.log('🔄 Initializing socket for user:', userId)
      await $socket.setUserOnline(userId)
      
      // Fetch user accounts on mount
      await fetchUserAccounts()
    } else {
      console.error('❌ No user ID available for socket connection')
      errorMessage.value = 'No user ID available after fetchUserData'
    }
  } catch (error) {
    console.error('Error during component initialization:', error)
    errorMessage.value = `Initialization error: ${error.message}`
  }
})

// Set user offline when component is unmounted
onUnmounted(() => {
  const userId = getUserId()
  if (userId) {
    $socket.setUserOffline(userId)
  }
  
  // Clear auto refresh interval
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Page meta
definePageMeta({
  title: 'Savings Tracking',
  middleware: 'auth',
  layout: 'global'
})
</script>