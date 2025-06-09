<template>
  <section class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
    <!-- Enhanced Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating Geometric Shapes -->
      <div class="absolute inset-0">
        <div class="floating-shape shape-1 absolute w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div class="floating-shape shape-2 absolute w-24 h-24 bg-purple-500/10 rounded-full blur-lg"></div>
        <div class="floating-shape shape-3 absolute w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div class="floating-shape shape-4 absolute w-28 h-28 bg-cyan-500/10 rounded-full blur-lg"></div>
        <div class="floating-shape shape-5 absolute w-36 h-36 bg-emerald-500/10 rounded-full blur-xl"></div>
        <div class="floating-shape shape-6 absolute w-20 h-20 bg-orange-500/10 rounded-full blur-md"></div>
      </div>
      
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 opacity-20">
        <div class="grid-background"></div>
      </div>
      
      <!-- Flowing Particles -->
      <div class="absolute inset-0">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
        <div class="particle particle-9"></div>
        <div class="particle particle-10"></div>
      </div>
      
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30"></div>
    </div>

    <div class="container mx-auto px-4 py-16 md:py-20 relative z-10">
      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col justify-center items-center py-20 transition-opacity duration-500">
        <div class="relative h-24 w-24">
          <div class="animate-spin rounded-full h-full w-full border-4 border-blue-300/30 border-t-blue-500"></div>
          <div class="animate-ping absolute inset-0 rounded-full bg-blue-500/20"></div>
        </div>
        <p class="text-white/80 mt-8 text-xl tracking-wide font-light">Memuat produk tabungan...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-lg mx-auto transition-all duration-500">
        <div class="bg-white/10 backdrop-blur-lg border border-red-300/30 rounded-3xl p-8 text-center shadow-2xl">
          <div class="relative">
            <svg class="w-20 h-20 text-red-400 mx-auto mb-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h3 class="text-white font-bold text-2xl mb-3">Gagal Memuat Data</h3>
          <p class="text-white/70 mb-8 leading-relaxed">Terjadi kesalahan saat mengambil data produk. Silakan periksa koneksi Anda.</p>
          <button @click="refresh()" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-10 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center mx-auto group">
            <svg class="w-5 h-5 inline mr-3 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products && products.length > 0">
        <div class="text-center mb-20">
          <div class="relative inline-block">
            <h2 class="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 tracking-tight mb-6 animate-fade-in">
              Pilihan Produk Terbaik
            </h2>
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 animate-pulse"></div>
          </div>
          <p class="text-white/80 mt-6 max-w-3xl mx-auto text-xl leading-relaxed font-light">
            Kami menyediakan berbagai pilihan tabungan dengan keunggulan masing-masing untuk memenuhi kebutuhan finansial Anda.
          </p>
          <div class="flex justify-center mt-8">
            <div class="w-32 h-1.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full relative">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(product, index) in products" :key="product._id" 
               class="group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/20 hover:border-white/40 transform hover:-translate-y-3 hover:rotate-1 card-hover"
               :style="{ animationDelay: `${index * 0.1}s` }">
            
            <!-- Premium Badge -->
            <div v-if="product.interestRate >= 4.5" class="absolute top-6 -right-2 z-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-2 rounded-l-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-all duration-300 animate-glow">
              <span class="flex items-center">
                <span class="animate-bounce mr-1">⭐</span>
                UNGGULAN
              </span>
            </div>

            <!-- Card Header with Enhanced Gradient -->
            <div :class="getHeaderGradient(product)" class="text-white p-8 relative overflow-hidden">
              <!-- Background Pattern -->
              <div class="absolute inset-0 opacity-10">
                <div class="bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
              </div>
              
              <div class="relative z-10">
                <h3 class="text-2xl md:text-3xl font-bold mb-3 transition-transform duration-300 group-hover:scale-105">
                  {{ product.name }}
                </h3>
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-sm opacity-90 block font-medium bg-white/20 px-3 py-1 rounded-full">{{ getProductType(product) }}</span>
                    <span class="text-xs opacity-75 mt-2 block">{{ product.compoundPeriod === 'daily' ? 'Bunga Harian' : 'Bunga Bulanan' }}</span>
                  </div>
                  <div class="text-right">
                    <span v-if="product.interestRate > 0" class="text-4xl md:text-5xl font-bold leading-none animate-pulse">
                      {{ product.interestRate }}<span class="text-2xl md:text-3xl">%</span>
                    </span>
                    <span v-else class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">Bagi Hasil</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-8 flex flex-col justify-between h-full">
              <div>
                <p class="text-gray-600 leading-relaxed mb-8 h-20 line-clamp-3 text-lg">{{ product.description }}</p>
                
                <div class="space-y-4 mb-8">
                  <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                    <span class="text-sm text-gray-600 font-medium">Saldo Minimum</span>
                    <span class="font-bold text-gray-800 text-lg">{{ formatCurrency(product.minBalance) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                    <span class="text-sm text-gray-600 font-medium">Batas Maksimal</span>
                    <span class="font-bold text-gray-800 text-lg">{{ product.maxBalance ? formatCurrency(product.maxBalance) : 'Tidak Terbatas' }}</span>
                  </div>
                </div>

                <div class="border-t border-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

                <div class="flex items-center justify-between mb-8">
                  <span :class="product.isActive ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'" 
                        class="px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-sm">
                    <div :class="product.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ product.isActive ? 'Tersedia' : 'Segera Hadir' }}
                  </span>
                  <span class="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Update: {{ formatDate(product.createdAt) }}</span>
                </div>
                
                <button 
                  @click="openAccount(product)"
                  :disabled="!product.isActive"
                  :class="getButtonClass(product)"
                  class="w-full py-4 px-6 mt-auto rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
                >
                  <span class="relative z-10">Buka Rekening</span>
                  <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-20 transition-opacity duration-500">
        <div class="max-w-md mx-auto">
          <div class="relative inline-block mb-8">
            <svg class="mx-auto h-32 w-32 text-white/30 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3.5 6.5l8-4 8 4M20.5 10.5v6l-8 4-8-4v-6M3.5 14.5l8 4 8-4M3.5 10.5l8-4 8 4m-17 0l8 4 8-4"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11.5 12.5a.5.5 0 11-1 0 .5.5 0 011 0z" stroke-opacity=".5"/>
            </svg>
            <div class="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 class="text-4xl font-bold text-white mb-6">Produk Akan Segera Hadir</h3>
          <p class="text-white/70 text-xl mb-10 leading-relaxed">Saat ini belum ada produk yang tersedia. Kami sedang mempersiapkan yang terbaik untuk Anda.</p>
          <button @click="refresh()" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <span class="flex items-center">
              <svg class="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Muat Ulang Halaman
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Account Opening Modal - Enhanced Design -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-all duration-500"
        @click.self="closeModal"
      >
        <div class="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-500 scale-100 max-h-[90vh] overflow-y-auto border border-white/20">
          <!-- Modal Header -->
          <div :class="selectedProduct ? getHeaderGradient(selectedProduct) : 'bg-gradient-to-br from-blue-600 to-blue-700'" class="text-white p-8 rounded-t-3xl relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <div class="bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
            </div>
            <button @click="closeModal" class="absolute top-6 right-6 text-white hover:text-gray-200 transition-all duration-200 z-10 hover:rotate-90 transform bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 class="text-3xl font-bold mb-3 relative z-10">Buka Rekening Tabungan</h3>
            <p class="text-sm opacity-90 relative z-10 bg-white/20 px-3 py-1 rounded-full inline-block">{{ selectedProduct?.name || 'Loading...' }}</p>
          </div>

          <!-- Modal Body -->
          <div class="p-8">
            <!-- Product Summary -->
            <div v-if="selectedProduct" class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-inner">
              <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-gray-600 font-medium">Suku Bunga</span>
                <span class="text-2xl font-bold text-blue-600 animate-pulse">
                  {{ selectedProduct.interestRate > 0 ? selectedProduct.interestRate + '%' : 'Bagi Hasil' }}
                </span>
              </div>
              <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-gray-600 font-medium">Saldo Minimum</span>
                <span class="font-semibold text-gray-800 text-lg">{{ formatCurrency(selectedProduct.minBalance) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 font-medium">Jenis Bunga</span>
                <span class="font-semibold text-gray-800 bg-white px-3 py-1 rounded-full text-sm">{{ selectedProduct.compoundPeriod === 'daily' ? 'Harian' : 'Bulanan' }}</span>
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitAccountOpening" class="space-y-8">
              <!-- Initial Deposit -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Setoran Awal
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">Rp</span>
                  <input
                    v-model="initialDeposit"
                    type="number"
                    :min="selectedProduct?.minBalance || 0"
                    required
                    class="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 text-lg font-medium bg-white/80 backdrop-blur-sm hover:shadow-lg"
                    :placeholder="`Minimum ${formatCurrency(selectedProduct?.minBalance || 0)}`"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-1 rounded-full inline-block">
                  Minimum setoran: {{ formatCurrency(selectedProduct?.minBalance || 0) }}
                </p>
              </div>

              <!-- Terms Agreement -->
              <div class="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                <input
                  v-model="agreeToTerms"
                  type="checkbox"
                  id="terms"
                  required
                  class="mt-1 h-5 w-5 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                />
                <label for="terms" class="text-sm text-gray-600 leading-relaxed">
                  Saya menyetujui 
                  <a href="#" class="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 hover:no-underline transition-all duration-200">syarat dan ketentuan</a> 
                  serta 
                  <a href="#" class="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 hover:no-underline transition-all duration-200">kebijakan privasi</a> 
                  yang berlaku untuk pembukaan rekening tabungan ini.
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4 pt-6">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !agreeToTerms || !initialDeposit"
                  :class="[
                    'flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group',
                    isSubmitting || !agreeToTerms || !initialDeposit
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : selectedProduct?.name.toLowerCase().includes('syariah')
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  ]"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="relative z-10">{{ isSubmitting ? 'Memproses...' : 'Buka Rekening' }}</span>
                  <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
// Import required composables and utilities
const toast = useNuxtApp().$toast

// SEO Meta
useHead({
  title: 'Produk Tabungan - Banking App',
  middleware: 'auth',
  meta: [
    { name: 'description', content: 'Pilih produk tabungan yang sesuai dengan kebutuhan finansial Anda dengan bunga kompetitif dan layanan terbaik' }
  ]
})
const { $socket } = useNuxtApp()
// Get user profile - pastikan composable ini tersedia
const {getUserId , fetchUserData} = useProfile()

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
// untuk data api producy ambil dari api/savings/products
// const { data, pending, error } = await useFetch('/api/savings/products')


// const refresh = () => {
//   console.log('Refreshing data...')
// }

// Modal state - pastikan semua reactive variables didefinisikan dengan benar
const showModal = ref(false)
const selectedProduct = ref(null)
const initialDeposit = ref(null)
const agreeToTerms = ref(false)
const isSubmitting = ref(false)

// Extract products from response
const { data, error } = await useFetch('/api/savings/products')

const products = computed(() => {
  if (data.value && data.value.success && data.value.data) {
    console.log('Products loaded:', data.value.data.length)
    return data.value.data
  }
  return []
})


// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getProductType = (product) => {
  if (product.name.toLowerCase().includes('syariah')) return 'Produk Syariah'
  if (product.name.toLowerCase().includes('deposito')) return 'Deposito Berjangka'
  if (product.name.toLowerCase().includes('pendidikan')) return 'Tabungan Pendidikan'
  if (product.name.toLowerCase().includes('hari tua')) return 'Tabungan Pensiun'
  return 'Tabungan Reguler'
}

const getHeaderGradient = (product) => {
  if (product.name.toLowerCase().includes('syariah')) return 'bg-gradient-to-br from-emerald-600 to-teal-700'
  if (product.name.toLowerCase().includes('deposito')) return 'bg-gradient-to-br from-purple-600 to-indigo-700'
  if (product.name.toLowerCase().includes('pendidikan')) return 'bg-gradient-to-br from-orange-500 to-red-600'
  if (product.name.toLowerCase().includes('hari tua')) return 'bg-gradient-to-br from-amber-500 to-orange-600'
  return 'bg-gradient-to-br from-blue-600 to-blue-700'
}

const getButtonClass = (product) => {
  if (!product.isActive) return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  
  if (product.name.toLowerCase().includes('syariah')) 
    return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-lg hover:scale-105'
  if (product.name.toLowerCase().includes('deposito')) 
    return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg hover:scale-105'
  if (product.name.toLowerCase().includes('pendidikan')) 
    return 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white hover:shadow-lg hover:scale-105'
  if (product.name.toLowerCase().includes('hari tua')) 
    return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white hover:shadow-lg hover:scale-105'
  
  return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg hover:scale-105'
}



// Modal functions - Perbaikan utama ada di sini
const openAccount = (product) => {
  console.log('Opening account for product:', product)
  console.log('User ID:', getUserId()) // pastikan ini ada
  if (!product) {
    console.error('Product is null or undefined')
    return
  }
  
  if (product.isActive) {
    console.log('Opening modal for active product')
    selectedProduct.value = product
    initialDeposit.value = product.minBalance
    agreeToTerms.value = false
    showModal.value = true
    
    // Pastikan modal benar-benar terbuka
    nextTick(() => {
      console.log('Modal state after nextTick:', showModal.value)
    })
  } else {
    console.log('Product is not active:', product.name)
    // Anda bisa menambahkan toast notification di sini
    alert('Produk ini sedang tidak tersedia')
  }
}

const closeModal = () => {
  console.log('Closing modal')
  showModal.value = false
  selectedProduct.value = null
  initialDeposit.value = null
  agreeToTerms.value = false
  isSubmitting.value = false
}

// Submit account opening
const submitAccountOpening = async () => {
  try {
    isSubmitting.value = true
    console.log('Submitting account opening...')

    const body = {
      userId: getUserId(), // pastikan ini ada
      productId: selectedProduct.value._id,
      initialDeposit: parseFloat(initialDeposit.value || 0),
    }

    const { data, error } = await useFetch('/api/savings/accounts', {
      method: 'POST',
      body,
    })

    if (error.value) {
      throw new Error(error.value.data?.statusMessage || 'Terjadi kesalahan saat membuka rekening.')
    }

    // Tampilkan notifikasi berhasil (gunakan toast kalau ada)
    toast(`🎉 Rekening ${selectedProduct.value.name} berhasil dibuka!`)
    
    // Tutup modal
    closeModal()

  } catch (error) {
    console.error('Error opening account:', error)
    alert(`❌ Terjadi kesalahan: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}


// Watch for modal changes - untuk debugging
watch(showModal, (newVal) => {
  console.log('Modal visibility changed:', newVal)
})

watch(selectedProduct, (newVal) => {
  console.log('Selected product changed:', newVal?.name)
})

// Initialize on mounted
onMounted(() => {
  console.log('Component mounted, products:', products.value.length)
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced Background Animations */
.floating-shape {
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  top: 20%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  top: 60%;
  left: 10%;
  animation-delay: -10s;
}

.shape-4 {
  top: 80%;
  right: 20%;
  animation-delay: -15s;
}

.shape-5 {
  top: 40%;
  right: 5%;
  animation-delay: -7s;
}

.shape-6 {
  top: 70%;
  left: 60%;
  animation-delay: -12s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-30px) rotate(3deg);
  }
}

/* Grid Background */
.grid-background {
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 30s linear infinite;
  height: 100%;
  width: 100%;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* Particle Animations */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.particle-1 {
  top: 10%;
  left: 20%;
  animation: particleFloat 15s ease-in-out infinite;
  animation-delay: 0s;
}

.particle-2 {
  top: 30%;
  left: 80%;
  animation: particleFloat 18s ease-in-out infinite;
  animation-delay: -3s;
}

.particle-3 {
  top: 50%;
  left: 10%;
  animation: particleFloat 22s ease-in-out infinite;
  animation-delay: -6s;
}

.particle-4 {
  top: 70%;
  left: 70%;
  animation: particleFloat 16s ease-in-out infinite;
  animation-delay: -9s;
}

.particle-5 {
  top: 20%;
  left: 50%;
  animation: particleFloat 20s ease-in-out infinite;
  animation-delay: -12s;
}

.particle-6 {
  top: 80%;
  left: 30%;
  animation: particleFloat 19s ease-in-out infinite;
  animation-delay: -15s;
}

.particle-7 {
  top: 40%;
  left: 90%;
  animation: particleFloat 17s ease-in-out infinite;
  animation-delay: -18s;
}

.particle-8 {
  top: 60%;
  left: 15%;
  animation: particleFloat 21s ease-in-out infinite;
  animation-delay: -21s;
}

.particle-9 {
  top: 15%;
  left: 75%;
  animation: particleFloat 14s ease-in-out infinite;
  animation-delay: -24s;
}

.particle-10 {
  top: 85%;
  left: 60%;
  animation: particleFloat 23s ease-in-out infinite;
  animation-delay: -27s;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-100px) translateX(50px);
    opacity: 1;
  }
  50% {
    transform: translateY(-50px) translateX(-30px);
    opacity: 0.7;
  }
  75% {
    transform: translateY(-150px) translateX(20px);
    opacity: 0.5;
  }
}

/* Card Animations */
.card-hover {
  animation: cardSlideIn 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes cardSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glow Effect */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.8);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

/* Float Animation for Empty State */
@keyframes floatSoft {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: floatSoft 3s ease-in-out infinite;
}

/* Modal styles */
.fixed.inset-0 {
  backdrop-filter: blur(12px);
}

/* Pastikan z-index modal sangat tinggi */
.z-\[9999\] {
  z-index: 9999;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.5);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2563eb, #7c3aed);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .floating-shape {
    display: none;
  }
  
  .particle {
    display: none;
  }
}
</style>