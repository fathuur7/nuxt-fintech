<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-md mx-auto">
      <!-- Loading State -->
      <div v-if="userLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="currentUser">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Top Up Saldo</h1>
          <p class="text-gray-600">Halo {{ currentUser.fullName || currentUser.username }}, isi ulang saldo untuk transaksi Anda</p>
        </div>

        <!-- User Info Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ currentUser.fullName || currentUser.username }}</p>
              <p class="text-sm text-gray-600">{{ currentUser.email }}</p>
            </div>
          </div>
          
          <div class="text-center border-t pt-4">
            <p class="text-gray-500 text-sm mb-2">Saldo Saat Ini</p>
            <p class="text-3xl font-bold text-gray-800">{{ formatCurrency(currentUser.balance || 0) }}</p>
            <p class="text-xs text-gray-500 mt-1">Terakhir diupdate: {{ formatDate(currentUser.lastBalanceUpdate) }}</p>
          </div>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <form @submit.prevent="handleTopUp">
            <!-- Amount Input -->
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-semibold mb-3">
                Jumlah Top Up
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  Rp
                </span>
                <input
                  v-model="amount"
                  type="number"
                  placeholder="0"
                  class="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  :class="{ 'border-red-500': amountError }"
                  min="10000"
                  step="1000"
                />
              </div>
              <p v-if="amountError" class="text-red-500 text-sm mt-2">{{ amountError }}</p>
              <p class="text-gray-500 text-sm mt-2">Minimum top up Rp 10.000</p>
            </div>

            <!-- Quick Amount Buttons -->
            <div class="mb-6">
              <p class="text-gray-700 text-sm font-semibold mb-3">Pilih Cepat</p>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="quickAmount in quickAmounts"
                  :key="quickAmount"
                  type="button"
                  @click="selectQuickAmount(quickAmount)"
                  class="py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  :class="{ 'bg-blue-50 border-blue-300': amount == quickAmount }"
                >
                  {{ formatCurrency(quickAmount) }}
                </button>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="mb-6">
              <p class="text-gray-700 text-sm font-semibold mb-3">Metode Pembayaran</p>
              <div class="border border-gray-300 rounded-xl p-4 bg-gray-50">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="font-semibold text-gray-800">Midtrans Payment</p>
                    <p class="text-sm text-gray-600">Bank Transfer, E-Wallet, Credit Card</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Jumlah Top Up</span>
                <span class="font-semibold">{{ formatCurrency(amount || 0) }}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Biaya Admin</span>
                <span class="font-semibold text-green-600">Gratis</span>
              </div>
              <hr class="border-gray-300 my-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600">Saldo Setelah Top Up</span>
                <span class="font-semibold text-blue-600">{{ formatCurrency((currentUser.balance || 0) + (parseInt(amount) || 0)) }}</span>
              </div>
              <hr class="border-gray-300 my-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-800">Total Bayar</span>
                <span class="font-bold text-lg text-blue-600">{{ formatCurrency(amount || 0) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!amount || amount < 10000 || loading || !currentUser"
              class="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors relative"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
              <span v-else>Lanjutkan Pembayaran</span>
            </button>
          </form>
        </div>

        <!-- Security Note -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <div>
              <p class="text-sm font-semibold text-blue-800">Transaksi Aman</p>
              <p class="text-sm text-blue-700">Semua transaksi dilindungi dengan enkripsi SSL dan sistem keamanan Midtrans.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="userError" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-xl p-6">
          <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Data</h3>
          <p class="text-red-600 mb-4">{{ userError }}</p>
          <button 
            @click="refetchUserData"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- No User State -->
      <div v-else class="text-center py-12">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <svg class="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-lg font-semibold text-yellow-800 mb-2">Pengguna Tidak Ditemukan</h3>
          <p class="text-yellow-600 mb-4">Silakan login terlebih dahulu untuk melakukan top up.</p>
          <button 
            @click="goToLogin"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, computed, watch, onMounted } from 'vue'

// Meta
definePageMeta({
  title: 'Top Up Saldo',
  middleware: 'auth'
})

// Composables
const { user: currentUser, isLoading: userLoading, err: userError, fetchUserData } = useProfile()

// Data
const amount = ref('')
const loading = ref(false)
const amountError = ref('')

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000]

// Computed
const userId = computed(() => {
  return currentUser.value?._id || null
})

// Methods
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Belum tersedia'
  
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    return 'Format tanggal tidak valid'
  }
}

const selectQuickAmount = (quickAmount) => {
  amount.value = quickAmount
  amountError.value = ''
}

const validateAmount = () => {
  if (!amount.value) {
    amountError.value = 'Jumlah top up harus diisi'
    return false
  }
  if (amount.value < 10000) {
    amountError.value = 'Minimum top up adalah Rp 10.000'
    return false
  }
  if (amount.value > 10000000) {
    amountError.value = 'Maximum top up adalah Rp 10.000.000'
    return false
  }
  amountError.value = ''
  return true
}

const handleTopUp = async () => {
  if (!validateAmount()) return
  if (!userId.value) {
    alert('Data pengguna tidak tersedia. Silakan refresh halaman.')
    return
  }

  loading.value = true
  
  try {
    const response = await $fetch('/api/balance/topup', {
      method: 'POST',
      body: {
        userId: userId.value,
        amount: parseInt(amount.value),
        userEmail: currentUser.value?.email,
        userName: currentUser.value?.fullName || currentUser.value?.username
      }
    })

    if (response.success) {
      // Redirect to Midtrans payment page
      if (response.data.snapRedirectUrl) {
        window.location.href = response.data.snapRedirectUrl
        console.log('Redirecting to Midtrans payment page:', response.data.snapRedirectUrl)
      } else if (response.data.snapToken) {
        // Fallback: use snap token with Midtrans SDK
        if (typeof snap !== 'undefined') {
          snap.pay(response.data.snapToken, {
            onSuccess: function(result) {
              // Refresh user data after successful payment
              fetchUserData()
              navigateTo('/payment/success')
            console.log('Payment successful:', result)
            },
            onPending: function(result) {
              navigateTo('/payment/pending')
                console.log('Payment pending:', result)
            },
            onError: function(result) {
              navigateTo('/payment/error')
                console.error('Payment error:', result)
                alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.')
            }
          })
        } else {
          console.error('Midtrans Snap not loaded')
          alert('Payment system not available. Please try again.')
        }
      }
    } else {
      throw new Error(response.message || 'Top up failed')
    }
  } catch (error) {
    console.error('Top up error:', error)
    
    let errorMessage = 'Terjadi kesalahan saat memproses top up.'
    
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage + ' Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}

const refetchUserData = async () => {
  try {
    await fetchUserData()
  } catch (error) {
    console.error('Error refetching user data:', error)
  }
}

const goToLogin = () => {
  navigateTo('/auth/login')
}

// Watch amount changes to clear error
watch(amount, () => {
  if (amountError.value) {
    amountError.value = ''
  }
})

// Ensure user data is loaded
onMounted(() => {
  if (!currentUser.value && !userLoading.value) {
    fetchUserData()
  }
})
</script>

<style scoped>
/* Custom styles if needed */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Loading animation for better UX */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>