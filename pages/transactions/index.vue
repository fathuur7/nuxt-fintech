<!-- transaksi page -->
<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Transaksi</h1>
        <p class="mt-2 text-gray-600">Kelola dan pantau riwayat transaksi Anda</p>
      </div>

      <!-- Balance Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Saldo Anda</h2>
            <div v-if="balanceLoading" class="animate-pulse">
              <div class="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            <div v-else-if="balanceError" class="text-red-600">
              Error: {{ balanceError }}
            </div>
            <div v-else class="text-3xl font-bold text-green-600">
              Rp {{ formatCurrency(balance) }}
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="refreshBalance"
              :disabled="balanceLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <svg v-if="balanceLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Riwayat Transaksi</h2>
            <button 
              @click="refreshTransactions"
              :disabled="transactionsLoading"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="transactionsLoading && !transactions.length" class="p-6">
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="animate-pulse">
              <div class="flex items-center space-x-4">
                <div class="h-4 bg-gray-200 rounded w-1/5"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="transactionsError && !transactions.length" class="p-6 text-center">
          <div class="text-red-600 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Transaksi</h3>
          <p class="text-gray-600 mb-4">{{ transactionsError }}</p>
          <button 
            @click="refreshTransactions"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!transactions.length && !transactionsLoading" class="p-12 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Transaksi</h3>
          <p class="text-gray-600">Transaksi Anda akan muncul di sini setelah melakukan pembayaran</p>
        </div>

        <!-- Transactions List -->
        <div v-else-if="transactions.length" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ transaction._id?.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span :class="getTypeClass(transaction.type)">
                    {{ getTypeLabel(transaction.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span :class="transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'">
                    {{ transaction.type === 'debit' ? '-' : '+' }}Rp {{ formatCurrency(transaction.amount) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(transaction.status)">
                    {{ getStatusLabel(transaction.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Menampilkan {{ ((currentPage - 1) * limit) + 1 }} - {{ Math.min(currentPage * limit, totalTransactions) }} 
              dari {{ totalTransactions }} transaksi
            </div>
            <div class="flex space-x-2">
              <button 
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1 || transactionsLoading"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    'px-3 py-2 text-sm rounded-lg transition-colors',
                    page === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    transactionsLoading ? 'opacity-50 cursor-not-allowed' : ''
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              <button 
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages || transactionsLoading"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  meta: [
    { name: 'description', content: 'Halaman transaksi untuk melihat riwayat transaksi Anda.' },
    { name: 'keywords', content: 'transaksi, riwayat, pembayaran' }
  ]
})

import { useRoute } from 'vue-router'

const route = useRoute();

// Composables
const { fetchUserData, getUserId } = useProfile();
const { $socket } = useNuxtApp()

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
  const classes: Record<string, string> = {
    'topup': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    'withdraw': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return classes[type] || 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
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
    'pending': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    'completed': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    'failed': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    'cancelled': 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
}

// Initialize data when component is mounted
onMounted(() => {
  initializeData()
})
</script>