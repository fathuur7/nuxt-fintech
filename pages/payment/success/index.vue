<!-- pages/payment/success/index.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
    <div class="max-w-md mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Memproses transaksi...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="goToHome"
          class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>

      <!-- Success Content -->
      <div v-else>
        <!-- Success Animation -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-6 animate-bounce">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h1>
          <p class="text-gray-600">Halo {{ userName }}, top up saldo Anda telah berhasil diproses</p>
        </div>

        <!-- Transaction Details Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">Detail Transaksi</h2>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <span class="text-gray-600">Order ID</span>
              <span class="font-mono text-sm font-semibold text-gray-800">{{ transactionData.orderId }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <span class="text-gray-600">Transaction ID</span>
              <span class="font-mono text-sm font-semibold text-gray-800">{{ transactionData.transactionId || '-' }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <span class="text-gray-600">Jumlah Top Up</span>
              <span class="font-bold text-lg text-green-600">{{ formatCurrency(transactionData.amount) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <span class="text-gray-600">Metode Pembayaran</span>
              <span class="font-semibold text-gray-800">{{ formatPaymentMethod(transactionData.paymentType) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <span class="text-gray-600">Tanggal & Waktu</span>
              <span class="font-semibold text-gray-800">{{ formatDateTime(transactionData.createdAt) }}</span>
            </div>
            
            <div class="flex justify-between items-center py-3">
              <span class="text-gray-600">Status</span>
              <span :class="getStatusClass(transactionData.status)">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ formatStatus(transactionData.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- New Balance Card -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div class="text-center">
            <p class="text-blue-100 text-sm mb-2">Saldo Terkini Anda</p>
            <p class="text-3xl font-bold mb-2">{{ formatCurrency(currentBalance) }}</p>
            <div class="inline-flex items-center text-green-200 text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              +{{ formatCurrency(transactionData.amount) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="downloadReceipt"
            class="w-full bg-white border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Download Bukti Transaksi
          </button>
          
          <button
            @click="goToHome"
            class="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Kembali ke Beranda
          </button>
          
          <button
            @click="topUpAgain"
            class="w-full bg-transparent border border-blue-600 text-blue-600 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Top Up Lagi
          </button>
        </div>

        <!-- Help Section -->
        <div class="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div class="text-center">
            <h3 class="font-semibold text-gray-800 mb-2">Butuh Bantuan?</h3>
            <p class="text-sm text-gray-600 mb-4">
              Jika Anda mengalami masalah atau memiliki pertanyaan tentang transaksi ini
            </p>
            <div class="flex space-x-3">
              <button class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Live Chat
              </button>
              <button class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Meta
definePageMeta({
  title: 'Pembayaran Berhasil',
  middleware: 'auth'
})

// Composables
const { user, fetchUserData } = useProfile()
const route = useRoute()

// Reactive data
const loading = ref(true)
const error = ref(null)
const transactionData = ref({
  orderId: '',
  transactionId: '',
  amount: 0,
  status: 'pending',
  paymentType: '',
  createdAt: new Date()
})
const currentBalance = ref(0)

// Computed
const userName = computed(() => {
  return user.value?.name || 'User'
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(date))
}

const formatPaymentMethod = (paymentType) => {
  const methods = {
    'credit_card': 'Kartu Kredit',
    'bank_transfer': 'Transfer Bank',
    'echannel': 'Mandiri Bill',
    'permata': 'Permata VA',
    'bca': 'BCA VA',
    'bni': 'BNI VA',
    'bri': 'BRI VA',
    'gopay': 'GoPay',
    'qris': 'QRIS',
    'shopeepay': 'ShopeePay'
  }
  return methods[paymentType] || paymentType?.toUpperCase() || 'Unknown'
}

const formatStatus = (status) => {
  const statuses = {
    'success': 'Berhasil',
    'pending': 'Menunggu',
    'failed': 'Gagal',
    'expired': 'Kedaluwarsa'
  }
  return statuses[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'success': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800',
    'pending': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800',
    'failed': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800',
    'expired': 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

const downloadReceipt = () => {
  const receiptContent = `
FINTECH PAYMENT RECEIPT
=======================

Nama: ${userName.value}
Order ID: ${transactionData.value.orderId}
Transaction ID: ${transactionData.value.transactionId || '-'}
Jumlah: ${formatCurrency(transactionData.value.amount)}
Metode Pembayaran: ${formatPaymentMethod(transactionData.value.paymentType)}
Tanggal: ${formatDateTime(transactionData.value.createdAt)}
Status: ${formatStatus(transactionData.value.status)}

Saldo Sebelum: ${formatCurrency(currentBalance.value - transactionData.value.amount)}
Saldo Sesudah: ${formatCurrency(currentBalance.value)}

Terima kasih telah menggunakan layanan kami!
=======================
  `
  
  const element = document.createElement('a')
  const file = new Blob([receiptContent], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = `receipt-${transactionData.value.orderId}.txt`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const goToHome = () => {
  navigateTo('/dashboard')
}

const topUpAgain = () => {
  navigateTo('/topup')
}

const fetchTransactionDetails = async () => {
  try {
    loading.value = true
    error.value = null

    // Get parameters from URL
    const orderId = route.query.order_id
    const transactionStatus = route.query.transaction_status

    if (!orderId) {
      throw new Error('Order ID tidak ditemukan')
    }

    // Ensure user data is loaded first
    if (!user.value) {
      console.log('User data not found, fetching...')
      await fetchUserData()
      
      // Wait a bit for user data to be set
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (!user.value || !user.value._id) {
      throw new Error('Data user tidak ditemukan. Silakan login kembali.')
    }

    console.log('Fetching transaction details for:', orderId)
    console.log('User ID:', user.value._id)

    // Fetch transaction details from Midtrans API
    const statusResponse = await $fetch(`/api/balance/transaction/${orderId}/status`)
    
    if (!statusResponse.success) {
      throw new Error('Gagal mengambil status transaksi dari payment gateway')
    }

    // Get user transactions to find the specific transaction
    const userTransactions = await $fetch(`/api/user/${user.value._id}/transactions?limit=50`)
    
    if (!userTransactions.success) {
      throw new Error('Gagal mengambil riwayat transaksi user')
    }

    // Find the specific transaction
    const transaction = userTransactions.data.transactions.find(t => t.orderId === orderId)
    
    if (!transaction) {
      throw new Error('Transaksi tidak ditemukan dalam riwayat user')
    }

    // Set transaction data
    transactionData.value = {
      orderId: transaction.orderId,
      transactionId: transaction.transactionId || statusResponse.data.transaction_id,
      amount: transaction.amount,
      status: transaction.status,
      paymentType: transaction.paymentType || statusResponse.data.paymentType,
      createdAt: transaction.createdAt
    }

    // Get fresh user balance
    const balanceResponse = await $fetch(`/api/user/${user.value._id}/balance`)
    
    if (balanceResponse.success) {
      currentBalance.value = balanceResponse.data.balance
    } else {
      // Fallback to user data balance
      currentBalance.value = user.value.balance || 0
    }

    console.log('Transaction details loaded:', transactionData.value)
    console.log('Current balance:', currentBalance.value)

    // Verify transaction is successful
    if (transaction.status !== 'success') {
      console.warn('Transaction status is not success:', transaction.status)
      // Still show the page but with appropriate status
    }

  } catch (err) {
    console.error('Error fetching transaction details:', err)
    error.value = err.message || 'Terjadi kesalahan saat memuat data transaksi'
    
    // If user is not authenticated, redirect to login
    if (err.message?.includes('login') || err.statusCode === 401) {
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Add a small delay to ensure smooth animation
  setTimeout(() => {
    fetchTransactionDetails()
  }, 500)
})
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out 2;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>