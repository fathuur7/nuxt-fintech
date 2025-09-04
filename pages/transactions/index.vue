<!-- transaksi page -->
<template>
    <div class="relative min-h-screen rounded-2xl overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div class="flex items-center space-x-4 mb-4">
            <div class="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>"/>
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Transaksi
              </h1>
              <p class="mt-2 text-gray-300 text-lg">Kelola dan pantau riwayat transaksi Anda</p>
            </div>
          </div>
        </div>

        <!-- Balance Card -->
        <div class="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 hover:shadow-purple-500/25 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-4">
                <div class="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-white">Saldo Anda</h2>
              </div>
              
              <div v-if="balanceLoading" class="animate-pulse">
                <div class="h-10 bg-white/20 rounded-lg w-48"></div>
              </div>
              <div v-else-if="balanceError" class="text-red-400 bg-red-500/20 p-4 rounded-lg border border-red-500/30">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ balanceError }}</span>
                </div>
              </div>
              <div v-else class="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Rp {{ formatCurrency(balance) }}
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button 
                @click="refreshBalance"
                :disabled="balanceLoading"
                class="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div class="flex items-center space-x-2">
                  <svg v-if="balanceLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ balanceLoading ? 'Loading...' : 'Refresh' }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div class="px-8 py-6 border-b border-white/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-semibold text-white">Riwayat Transaksi</h2>
              </div>
              <button 
                @click="refreshTransactions"
                :disabled="transactionsLoading"
                class="group px-4 py-2 text-sm bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 transition-all duration-300 border border-white/20 hover:border-white/30"
              >
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>Refresh</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="transactionsLoading && !transactions.length" class="p-8">
            <div class="space-y-6">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="flex items-center space-x-6">
                  <div class="h-4 bg-white/20 rounded-lg w-1/5"></div>
                  <div class="h-4 bg-white/20 rounded-lg w-1/4"></div>
                  <div class="h-4 bg-white/20 rounded-lg w-1/6"></div>
                  <div class="h-4 bg-white/20 rounded-lg w-1/4"></div>
                  <div class="h-4 bg-white/20 rounded-lg w-1/6"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="transactionsError && !transactions.length" class="p-12 text-center">
            <div class="text-red-400 mb-6">
              <div class="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-medium text-white mb-3">Gagal Memuat Transaksi</h3>
            <p class="text-gray-300 mb-6">{{ transactionsError }}</p>
            <button 
              @click="refreshTransactions"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Coba Lagi
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="!transactions.length && !transactionsLoading" class="p-16 text-center">
            <div class="text-gray-400 mb-6">
              <div class="mx-auto w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-medium text-white mb-3">Belum Ada Transaksi</h3>
            <p class="text-gray-300 text-lg">Transaksi Anda akan muncul di sini setelah melakukan pembayaran</p>
          </div>

          <!-- Transactions List -->
          <div v-else-if="transactions.length" class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-white/5 border-b border-white/10">
                <tr>
                  <th class="px-8 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th class="px-8 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th class="px-8 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th class="px-8 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th class="px-8 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-white/5 transition-colors duration-200">
                  <td class="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-200">
                    <div class="flex items-center space-x-3">
                      <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span class="font-mono">{{ transaction._id?.substring(0, 8) }}...</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                    {{ formatDate(transaction.createdAt) }}
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-sm">
                    <span :class="getTypeClass(transaction.type)">
                      {{ getTypeLabel(transaction.type) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap text-sm font-semibold">
                    <span :class="transaction.type === 'debit' ? 'text-red-400' : 'text-green-400'">
                     Rp {{ formatCurrency(transaction.amount) }}
                    </span>
                  </td>
                  <td class="px-8 py-6 whitespace-nowrap">
                    <span :class="getStatusClass(transaction.status)">
                      {{ getStatusLabel(transaction.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="px-8 py-6 border-t border-white/20 bg-white/5">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-300">
                Menampilkan {{ ((currentPage - 1) * limit) + 1 }} - {{ Math.min(currentPage * limit, totalTransactions) }} 
                dari {{ totalTransactions }} transaksi
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1 || transactionsLoading"
                  class="px-4 py-2 text-sm bg-white/10 text-gray-200 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
                >
                  Sebelumnya
                </button>
                <div class="flex space-x-1">
                  <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    @click="goToPage(page)"
                    :disabled="transactionsLoading"
                    :class="[
                      'px-4 py-2 text-sm rounded-lg transition-all duration-200',
                      page === currentPage 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20',
                      transactionsLoading ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    {{ page }}
                  </button>
                </div>
                <button 
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages || transactionsLoading"
                  class="px-4 py-2 text-sm bg-white/10 text-gray-200 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
interface Transaction {
  _id: string
  userId: string
  type: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface UserBalance {
  userId: string
  name: string
  email: string
  balance: number
}

definePageMeta({
  middleware: 'auth',
  title: 'Transaksi',
  layout: 'global',
  meta: [
    { name: 'description', content: 'Halaman transaksi untuk melihat riwayat transaksi Anda.' },
    { name: 'keywords', content: 'transaksi, riwayat, pembayaran' }
  ]
})

import { useRoute } from 'vue-router'

const route = useRoute();

// Composables
const { fetchUserData, getUserId } = useProfile()
const { updatePresence } = useSupabaseRealtime()

// Reactive data
const transactions = ref<Transaction[]>([])
const transactionsLoading = ref(false)
const transactionsError = ref<string | null>(null)

const balance = ref<number>(0)
const balanceLoading = ref(false)
const balanceError = ref<string | null>(null)

const currentPage = ref(1)
const totalPages = ref(1)
const totalTransactions = ref(0)
const limit = 10

console.log('transactions page mounted', transactions)

// Cache for faster subsequent loads
const dataCache = ref<{
  transactions: Transaction[]
  balance: number
  lastFetch: number
} | null>(null)

const CACHE_DURATION = 30000 // 30 seconds

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const fetchTransactions = async (page: number = 1, useCache: boolean = true) => {
  try {
    // Check cache first
    if (useCache && dataCache.value && (Date.now() - dataCache.value.lastFetch) < CACHE_DURATION && page === 1) {
      transactions.value = dataCache.value.transactions
      return
    }

    transactionsLoading.value = true
    transactionsError.value = null
    
    const userId = getUserId()
    if (!userId) {
      throw new Error('User ID tidak ditemukan')
    }

    const response = await $fetch<{
      success: boolean
      data: {
        transactions: Transaction[]
        totalPages: number
        currentPage: number
        total: number
      }
    }>(`/api/user/${userId}/transactions`, {
      query: { page, limit },
      timeout: 10000 // 10 second timeout
    })

    if (response.success && response.data) {
      transactions.value = response.data.transactions
      totalPages.value = response.data.totalPages
      currentPage.value = response.data.currentPage
      totalTransactions.value = response.data.total
      console.log('Transactions fetched:', response.data.transactions)
      // Update cache for first page
      if (page === 1) {
        dataCache.value = {
          ...dataCache.value,
          transactions: response.data.transactions,
          balance: dataCache.value?.balance ?? balance.value,
          lastFetch: Date.now()
        }
      }
    } else {
      throw new Error('Format response tidak valid')
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    transactionsError.value = error instanceof Error ? error.message : 'Gagal memuat transaksi'
  } finally {
    transactionsLoading.value = false
  }
}

const fetchBalance = async (useCache: boolean = true) => {
  try {
    // Check cache first
    if (useCache && dataCache.value && (Date.now() - dataCache.value.lastFetch) < CACHE_DURATION) {
      balance.value = dataCache.value.balance
      return
    }

    balanceLoading.value = true
    balanceError.value = null
    
    const userId = getUserId()
    if (!userId) {
      throw new Error('User ID tidak ditemukan')
    }

    const response = await $fetch<{
      success: boolean
      data: UserBalance
    }>(`/api/user/${userId}/balance`, {
      timeout: 5000 // 5 second timeout
    })

    if (response.success && response.data) {
      balance.value = response.data.balance
      console.log('Balance fetched:', response.data.balance)
      // Update cache
      dataCache.value = {
        transactions: dataCache.value?.transactions ?? [],
        balance: response.data.balance,
        lastFetch: Date.now()
      }
    } else {
      throw new Error('Format response tidak valid')
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
    balanceError.value = error instanceof Error ? error.message : 'Gagal memuat saldo'
  } finally {
    balanceLoading.value = false
  }
}

// Initialize all data
const initializeData = async () => {
  try {
    // Ensure user data is available
    const userId = getUserId()
    if (!userId) {
      await fetchUserData()
    }

    const finalUserId = getUserId()
    if (!finalUserId) {
      throw new Error('User ID tidak tersedia')
    }

    // Initialize socket connection (non-blocking)
    $socket.setUserOnline(finalUserId).catch(console.error)
    
    // Fetch data in parallel for better performance
    await Promise.allSettled([
      fetchTransactions(1),
      fetchBalance()
    ])
    
  } catch (error) {
    console.error('Error initializing transaction page:', error)
    transactionsError.value = 'Gagal menginisialisasi halaman transaksi'
    balanceError.value = 'Gagal menginisialisasi saldo'
  }
}

const refreshTransactions = async () => {
  await fetchTransactions(currentPage.value, false) // Force refresh, bypass cache
}

const refreshBalance = async () => {
  await fetchBalance(false) // Force refresh, bypass cache
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value && !transactionsLoading.value) {
    await fetchTransactions(page, false)
  }
}

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeLabel = (type: string): string => {
  return type
}

const getTypeClass = (type: string): string => {
  return 'px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full border border-white/30'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': 'Menunggu',
    'completed': 'Selesai',
    'failed': 'Gagal',
    'cancelled': 'Dibatalkan'
  }
  return labels[status] || status
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    'pending': 'px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30',
    'completed': 'px-3 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full border border-green-500/30',
    'failed': 'px-3 py-1 text-xs font-medium bg-red-500/20 text-red-300 rounded-full border border-red-500/30',
    'cancelled': 'px-3 py-1 text-xs font-medium bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30'
  }
  return classes[status] || 'px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full border border-white/30'
}

// Initialize data when component is mounted
onMounted(() => {
  initializeData()
})

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
</script>