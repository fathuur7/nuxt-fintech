<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 py-12 px-4">
    <!-- Floating Decorative Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-1/4 right-1/4 w-48 h-48 bg-blue-300 rounded-full opacity-20 animate-bounce slow"></div>
      <div class="absolute bottom-1/4 left-1/3 w-36 h-36 bg-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div class="absolute -bottom-4 -right-4 w-96 h-96 bg-cyan-300 rounded-full opacity-15 animate-pulse delay-500"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center items-center py-20">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
          <div class="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="backdrop-blur-lg bg-white/30 border border-red-200/50 rounded-2xl p-8 shadow-2xl floating-card">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-red-800 font-bold text-lg">Oops! Terjadi Kesalahan</h3>
            <p class="text-red-600 text-sm mt-1">{{ error.data?.message || 'Gagal memuat profil pengguna' }}</p>
          </div>
        </div>
        <button 
          @click="refresh()" 
          class="mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Coba Lagi
          </span>
        </button>
      </div>

      <!-- Profile Content -->
      <div v-else-if="data?.success" class="space-y-8">
        <!-- Floating Header -->
        <div class="backdrop-blur-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 rounded-3xl p-8 text-white floating-card shadow-2xl border border-white/20">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Profil Pengguna
              </h1>
              <p class="text-purple-100 text-lg">Kelola informasi akun Anda dengan mudah</p>
            </div>
            <div class="hidden md:block">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Profile Card -->
        <div class="backdrop-blur-lg bg-white/40 rounded-3xl shadow-2xl overflow-hidden floating-card border border-white/50">
          <!-- Profile Header Section -->
          <div class="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-8 py-6 border-b border-white/30">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              Informasi Akun
            </h2>
          </div>
          
          <div class="p-8">
            <div class="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <!-- Floating Profile Picture -->
              <div class="flex-shrink-0 relative group">
                <div class="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 p-1 shadow-2xl floating-card">
                  <div class="w-full h-full rounded-3xl overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      v-if="data.data.picture && !imageError" 
                      :src="data.data.picture" 
                      :alt="data.data.name"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      @error="handleImageError"
                    >
                    <div v-else class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {{ getInitials(data.data.name) }}
                    </div>
                  </div>
                </div>
                <!-- Status Badge -->
                <div class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <!-- Profile Information Grid -->
              <div class="flex-1 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Name Card -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Nama Lengkap
                    </label>
                    <div class="backdrop-blur-sm bg-white/60 rounded-2xl p-4 border border-white/50 shadow-lg floating-item group-hover:bg-white/80 transition-all duration-300">
                      <p class="text-gray-900 font-bold text-lg">{{ data.data.name }}</p>
                    </div>
                  </div>

                  <!-- Email Card -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Alamat Email
                    </label>
                    <div class="backdrop-blur-sm bg-white/60 rounded-2xl p-4 border border-white/50 shadow-lg floating-item group-hover:bg-white/80 transition-all duration-300">
                      <p class="text-gray-900 font-medium">{{ data.data.email }}</p>
                    </div>
                  </div>

                  <!-- Balance Card -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      Saldo Akun
                    </label>
                    <div class="backdrop-blur-sm bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl p-4 border border-green-200/50 shadow-lg floating-item group-hover:from-green-100/80 group-hover:to-emerald-100/80 transition-all duration-300">
                      <p class="text-green-800 font-bold text-2xl flex items-center">
                        <span class="text-lg mr-1">Rp</span>
                        {{ formatCurrency(data.data.balance) }}
                        <svg class="w-5 h-5 ml-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </p>
                    </div>
                  </div>

                  <!-- User ID Card -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      User ID
                    </label>
                    <div class="backdrop-blur-sm bg-white/60 rounded-2xl p-4 border border-white/50 shadow-lg floating-item group-hover:bg-white/80 transition-all duration-300">
                      <p class="text-gray-700 font-mono text-sm break-all">{{ data.data.id }}</p>
                    </div>
                  </div>
                </div>

                <!-- Timestamps Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/30">
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Tanggal Bergabung
                    </label>
                    <div class="backdrop-blur-sm bg-pink-50/60 rounded-2xl p-4 border border-pink-200/50 shadow-lg floating-item group-hover:bg-pink-100/60 transition-all duration-300">
                      <p class="text-pink-800 font-medium">{{ formatDate(data.data.createdAt) }}</p>
                    </div>
                  </div>

                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-600 mb-2 flex items-center">
                      <svg class="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Terakhir Diperbarui
                    </label>
                    <div class="backdrop-blur-sm bg-orange-50/60 rounded-2xl p-4 border border-orange-200/50 shadow-lg floating-item group-hover:bg-orange-100/60 transition-all duration-300">
                      <p class="text-orange-800 font-medium">{{ formatDate(data.data.updatedAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="refresh()" 
            class="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl floating-card border border-white/20 backdrop-blur-sm"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span class="font-semibold">Refresh Data</span>
            </span>
          </button>
          
          <NuxtLink 
            to="/dashboard" 
            class="group bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl floating-card border border-white/20 backdrop-blur-sm"
          >
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <span class="font-semibold">Kembali</span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  middleware: 'auth'
})

// Reactive state for image error handling
const imageError = ref(false)

// Fetch user profile data
const { data, pending, error, refresh } = await useFetch('/api/user/profile', {
  headers: {
    'Content-Type': 'application/json'
  },
  server: false
})

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const handleImageError = () => {
  imageError.value = true
}

// SEO
useHead({
  title: 'Profil Pengguna - Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Lihat dan kelola informasi profil akun Anda dengan antarmuka yang modern dan elegan'
    }
  ]
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-15px) rotate(1deg); }
  66% { transform: translateY(-5px) rotate(-1deg); }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}

.floating-card {
  animation: float 6s ease-in-out infinite;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.floating-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.slow {
  animation-duration: 8s;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-500 {
  animation-delay: 0.5s;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #764ba2 0%, #667eea 100%);
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(10px)) {
  .backdrop-blur-lg {
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>