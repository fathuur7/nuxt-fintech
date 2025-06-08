<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    
    <div class="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div class="container mx-auto px-4 py-20 md:py-24">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Masa Depan Finansial Anda,
            <span class="block text-blue-300 font-light text-3xl md:text-5xl mt-2">
              Dirancang Sempurna
            </span>
          </h1>
          <p class="text-lg md:text-xl text-blue-100/80 mt-8 leading-relaxed">
            Temukan rangkaian produk simpanan eksklusif yang dirancang untuk bertumbuh bersama Anda. Nikmati suku bunga superior, fleksibilitas tak tertandingi, dan layanan prioritas untuk setiap langkah finansial Anda.
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 md:py-20">
      <div v-if="pending" class="flex flex-col justify-center items-center py-20 transition-opacity duration-300">
        <div class="relative h-20 w-20">
          <div class="animate-spin rounded-full h-full w-full border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <p class="text-gray-500 mt-6 text-lg tracking-wide">Memuat produk tabungan...</p>
      </div>

      <div v-else-if="error" class="max-w-lg mx-auto transition-opacity duration-300">
        <div class="bg-red-50/50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-lg">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 class="text-red-800 font-bold text-2xl mb-2">Gagal Memuat Data</h3>
          <p class="text-red-700 mb-6">Terjadi kesalahan saat mengambil data produk. Silakan periksa koneksi Anda.</p>
          <button @click="refresh()" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center mx-auto">
            <svg class="w-5 h-5 inline mr-2 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Coba Lagi
          </button>
        </div>
      </div>

      <div v-else-if="products && products.length > 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">Pilihan Produk Terbaik</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Kami menyediakan berbagai pilihan tabungan dengan keunggulan masing-masing untuk memenuhi kebutuhan finansial Anda.
          </p>
          <div class="w-28 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mt-6"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(product, index) in products" :key="product._id" class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-transparent hover:border-blue-400 transform hover:-translate-y-2">
            
            <div v-if="product.interestRate >= 4.5" class="absolute top-4 -right-1 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1.5 rounded-l-full text-xs font-bold shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              ⭐ UNGGULAN
            </div>

            <div :class="getHeaderGradient(product)" class="text-white p-6 relative">
              <div class="relative z-10">
                <h3 class="text-2xl font-bold mb-2 transition-transform duration-300">
                  {{ product.name }}
                </h3>
                <div class="flex items-end justify-between">
                  <div>
                    <span class="text-sm opacity-90 block font-medium">{{ getProductType(product) }}</span>
                    <span class="text-xs opacity-75">{{ product.compoundPeriod === 'daily' ? 'Bunga Harian' : 'Bunga Bulanan' }}</span>
                  </div>
                  <div class="text-right">
                    <span v-if="product.interestRate > 0" class="text-4xl font-bold leading-none">{{ product.interestRate }}<span class="text-2xl">%</span></span>
                    <span v-else class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-gray-600 font-medium">Bagi Hasil</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 flex flex-col justify-between h-full">
              <div>
                <p class="text-gray-600 leading-relaxed mb-6 h-20 line-clamp-3">{{ product.description }}</p>
                
                <div class="space-y-3 mb-6">
                  <div class="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg">
                    <span class="text-sm text-gray-500">Saldo Minimum</span>
                    <span class="font-bold text-gray-800 text-base">{{ formatCurrency(product.minBalance) }}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg">
                    <span class="text-sm text-gray-500">Batas Maksimal</span>
                    <span class="font-bold text-gray-800 text-base">{{ product.maxBalance ? formatCurrency(product.maxBalance) : 'Tidak Terbatas' }}</span>
                  </div>
                </div>

                <div class="border-t border-gray-100 my-6"></div>

                <div class="flex items-center justify-between mb-6">
                  <span :class="product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'" class="px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <div :class="product.isActive ? 'bg-green-500' : 'bg-gray-400'" class="w-2 h-2 rounded-full mr-2"></div>
                    {{ product.isActive ? 'Tersedia' : 'Segera Hadir' }}
                  </span>
                  <span class="text-xs text-gray-400">Update: {{ formatDate(product.createdAt) }}</span>
                </div>
              </div>

              <button :disabled="!product.isActive" :class="getButtonClass(product)" class="w-full py-3.5 px-6 mt-auto rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105" @click="openAccount(product)">
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  {{ product.isActive ? 'Buka Rekening' : 'Tidak Tersedia' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 transition-opacity duration-300">
        <div class="max-w-md mx-auto">
          <svg class="mx-auto h-28 w-28 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3.5 6.5l8-4 8 4M20.5 10.5v6l-8 4-8-4v-6M3.5 14.5l8 4 8-4M3.5 10.5l8-4 8 4m-17 0l8 4 8-4"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11.5 12.5a.5.5 0 11-1 0 .5.5 0 011 0z" stroke-opacity=".5"/>
          </svg>
          <h3 class="text-3xl font-bold text-gray-700 mb-4">Produk Akan Segera Hadir</h3>
          <p class="text-gray-500 text-lg mb-8">Saat ini belum ada produk yang tersedia. Kami sedang mempersiapkan yang terbaik untuk Anda.</p>
          <button @click="refresh()" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO Meta
useHead({
  title: 'Produk Tabungan - Banking App',
  meta: [
    { name: 'description', content: 'Pilih produk tabungan yang sesuai dengan kebutuhan finansial Anda dengan bunga kompetitif dan layanan terbaik' }
  ]
})

// Fetch savings products data - Fixed approach
const { data, pending, error, refresh } = await useFetch('/api/savings/products')

// Extract products from response
const products = computed(() => {
  if (data.value && data.value.success && data.value.data) {
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

const getCardAnimation = (index) => {
  const delays = ['animate-fade-in-up', 'animate-fade-in-up-delay-1', 'animate-fade-in-up-delay-2']
  return delays[index % 3] || 'animate-fade-in-up'
}

const openAccount = (product) => {
  if (product.isActive) {
    // Navigate to account opening form
    console.log('Opening account for:', product.name)
    // navigateTo(`/savings/open/${product._id}`)
  }
}
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

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-fade-in-up-delay-1 {
  animation: fade-in-up 0.6s ease-out 0.2s both;
}

.animate-fade-in-up-delay-2 {
  animation: fade-in-up 0.6s ease-out 0.4s both;
}
</style>