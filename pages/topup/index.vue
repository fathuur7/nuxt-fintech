<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8 px-4">
    <!-- Desktop Layout Container -->
    <div class="max-w-6xl mx-auto">
      <!-- Loading State -->
      <div v-if="userLoading" class="flex items-center justify-center min-h-[400px] md:min-h-[600px]">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 md:h-16 md:w-16 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 text-lg">Memuat data pengguna...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="currentUser" class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <!-- Left Column: Header & User Info (Mobile: Full Width, Desktop: 1/3) -->
        <div class="lg:col-span-1">
          <!-- Header -->
          <div class="text-center lg:text-left mb-6 lg:mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full mb-4">
              <svg class="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Top Up Saldo</h1>
            <p class="text-gray-600 text-base md:text-lg">Halo {{ currentUser.fullName || currentUser.username }}, isi ulang saldo untuk transaksi Anda</p>
          </div>

          <!-- User Info Card -->
          <div class="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-8 mb-6 lg:sticky lg:top-8">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg class="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-lg md:text-xl">{{ currentUser.fullName || currentUser.username }}</p>
                <p class="text-sm md:text-base text-gray-600">{{ currentUser.email }}</p>
              </div>
            </div>
            
            <div class="text-center border-t pt-6">
              <p class="text-gray-500 text-sm md:text-base mb-2">Saldo Saat Ini</p>
              <p class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{{ formatCurrency(currentUser.balance || 0) }}</p>
              <p class="text-xs md:text-sm text-gray-500">Terakhir diupdate: {{ formatDate(currentUser.lastBalanceUpdate) }}</p>
            </div>
          </div>

          <!-- Security Note (Desktop Only - Moved to sidebar) -->
          <div class="hidden lg:block bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div>
                <p class="text-base font-semibold text-blue-800 mb-2">Transaksi Aman</p>
                <p class="text-sm text-blue-700 leading-relaxed">Semua transaksi dilindungi dengan enkripsi SSL dan sistem keamanan Midtrans yang terpercaya.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Form (Mobile: Full Width, Desktop: 2/3) -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl lg:rounded-3xl shadow-lg p-6 md:p-8 lg:p-10">
            <form @submit.prevent="handleTopUp">
              <!-- Amount Input -->
              <div class="mb-8">
                <label class="block text-gray-700 text-sm md:text-base font-semibold mb-4">
                  Jumlah Top Up
                </label>
                <div class="relative">
                  <span class="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg md:text-xl">
                    Rp
                  </span>
                  <input
                    v-model="amount"
                    type="number"
                    placeholder="0"
                    class="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-4 md:py-6 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg md:text-2xl font-semibold transition-all duration-200"
                    :class="{ 'border-red-500 focus:ring-red-500': amountError }"
                    min="10000"
                    step="1000"
                  />
                </div>
                <p v-if="amountError" class="text-red-500 text-sm md:text-base mt-3">{{ amountError }}</p>
                <p class="text-gray-500 text-sm md:text-base mt-2">Minimum top up Rp 10.000</p>
              </div>

              <!-- Quick Amount Buttons -->
              <div class="mb-8">
                <p class="text-gray-700 text-sm md:text-base font-semibold mb-4">Pilih Cepat</p>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
                  <button
                    v-for="quickAmount in quickAmounts"
                    :key="quickAmount"
                    type="button"
                    @click="selectQuickAmount(quickAmount)"
                    class="py-3 md:py-4 px-4 md:px-6 border border-gray-300 rounded-xl md:rounded-2xl text-sm md:text-base font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:scale-105 active:scale-95"
                    :class="{ 'bg-blue-50 border-blue-300 ring-2 ring-blue-200': amount == quickAmount }"
                  >
                    {{ formatCurrency(quickAmount) }}
                  </button>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-8">
                <p class="text-gray-700 text-sm md:text-base font-semibold mb-4">Metode Pembayaran</p>
                <div class="border border-gray-300 rounded-xl md:rounded-2xl p-4 md:p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div class="flex items-center">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <div class="ml-4 md:ml-6">
                      <p class="font-semibold text-gray-800 text-base md:text-lg">Midtrans Payment</p>
                      <p class="text-sm md:text-base text-gray-600">Bank Transfer, E-Wallet, Credit Card</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl md:rounded-2xl p-6 md:p-8 mb-8 border border-gray-200">
                <h3 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Ringkasan Transaksi</h3>
                
                <div class="space-y-3 md:space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm md:text-base">Jumlah Top Up</span>
                    <span class="font-semibold text-base md:text-lg">{{ formatCurrency(amount || 0) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm md:text-base">Biaya Admin</span>
                    <span class="font-semibold text-green-600 text-base md:text-lg">Gratis</span>
                  </div>
                  <hr class="border-gray-300">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm md:text-base">Saldo Setelah Top Up</span>
                    <span class="font-semibold text-blue-600 text-base md:text-lg">
                      {{ formatCurrency((currentUser.balance || 0) + (amount || 0)) }}
                    </span>
                  </div>
                  <hr class="border-gray-400">
                  <div class="flex justify-between items-center pt-2">
                    <span class="font-semibold text-gray-800 text-base md:text-lg">Total Bayar</span>
                    <span class="font-bold text-xl md:text-2xl text-blue-600">{{ formatCurrency(amount || 0) }}</span>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="!amount || amount < 10000 || loading || !currentUser"
                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 md:py-6 rounded-xl md:rounded-2xl font-semibold text-lg md:text-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
                <span v-else>Lanjutkan Pembayaran</span>
              </button>
            </form>
          </div>

          <!-- Security Note (Mobile Only) -->
          <div class="lg:hidden mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div>
                <p class="text-sm font-semibold text-blue-800">Transaksi Aman</p>
                <p class="text-sm text-blue-700">Semua transaksi dilindungi dengan enkripsi SSL dan sistem keamanan Midtrans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="userError" class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-8 md:p-12">
          <svg class="w-16 h-16 md:w-20 md:h-20 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-xl md:text-2xl font-semibold text-red-800 mb-4">Gagal Memuat Data</h3>
          <p class="text-red-600 mb-6 text-base md:text-lg">{{ userError }}</p>
          <button 
            @click="refetchUserData"
            class="bg-red-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-red-700 transition-colors text-base md:text-lg font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- No User State -->
      <div v-else class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 md:p-12">
          <svg class="w-16 h-16 md:w-20 md:h-20 text-yellow-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3 class="text-xl md:text-2xl font-semibold text-yellow-800 mb-4">Pengguna Tidak Ditemukan</h3>
          <p class="text-yellow-600 mb-6 text-base md:text-lg">Silakan login terlebih dahulu untuk melakukan top up.</p>
          <button 
            @click="goToLogin"
            class="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-blue-700 transition-colors text-base md:text-lg font-semibold"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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

const { getUserId } = useProfile();
const { $socket } = useNuxtApp()

// Login dan set online
onMounted(async () => {
  await fetchUserData()
  
  // Set user online after data is fetched
  const userId = getUserId()
  if (userId) {
    console.log('🔄 Initializing socket for user:', userId)
    await $socket.setUserOnline(userId)
  } else {
    console.error('❌ No user ID available for socket connection')
  }
})

// Set user offline when component is unmounted
onUnmounted(() => {
  const userId = getUserId()
  if (userId) {
    $socket.setUserOffline(userId)
  }
})

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
/* Custom styles for better responsiveness */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Enhanced loading animation */
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

/* Smooth transitions for all interactive elements */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Focus states for better accessibility */
button:focus,
input:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Custom scrollbar for desktop */
@media (min-width: 1024px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

/* Hover effects for better desktop experience */
@media (hover: hover) {
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }
  
  .hover\:scale-\[1\.02\]:hover {
    transform: scale(1.02);
  }
}

/* Enhanced mobile touch targets */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>