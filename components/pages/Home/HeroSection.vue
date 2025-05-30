<template>
  <section class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-1/2 -left-32 w-64 h-64 bg-green-500 rounded-full opacity-15 animate-bounce slow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
      
      <!-- Floating Particles -->
      <div class="absolute inset-0">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-white text-lg">Memuat data profil...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-6 py-20">
      <div class="flex flex-col lg:flex-row items-center justify-between min-h-screen">
        
        <!-- Left Content -->
        <div class="flex-1 text-white space-y-8 lg:pr-12">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm">
            <svg class="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-green-400 font-medium">Fintech Terpercaya 2025</span>
          </div>

          <!-- Main Heading -->
          <div class="space-y-4">
            <h1 class="text-5xl lg:text-7xl font-bold leading-tight">
              <span class="block bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Revolusi
              </span>
              <span class="block bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Keuangan Digital
              </span>
              <span class="block text-white">
                Indonesia
              </span>
            </h1>
            
            <p class="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed">
              Platform fintech terdepan yang menghadirkan solusi pembayaran digital, 
              investasi, dan layanan keuangan inovatif untuk semua kalangan.
            </p>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              @click="handleInvestment"
              :disabled="isLoading"
              class="group bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                {{ user ? 'Kelola Investasi' : 'Mulai Investasi' }}
              </span>
            </button>
            
            <button 
              @click="handleContact"
              class="group border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Hubungi Kami
              </span>
            </button>
          </div>

          <!-- Dynamic Stats -->
          <div class="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-400">{{ formatNumber(stats.activeUsers) }}+</div>
              <div class="text-sm text-gray-400">Pengguna Aktif</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-cyan-400">{{ formatCurrency(stats.totalTransactions) }}+</div>
              <div class="text-sm text-gray-400">Transaksi Diproses</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400">{{ stats.uptime }}%</div>
              <div class="text-sm text-gray-400">Uptime Platform</div>
            </div>
          </div>
        </div>

        <!-- Right Content - App Showcase -->
        <div class="flex-1 lg:pl-12 mt-12 lg:mt-0">
          <div class="relative">
            <!-- Main App Card -->
            <div class="floating-card backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-xl font-bold text-white">FinanceFlow App</h3>
                  <p class="text-blue-300">Dashboard Keuangan</p>
                </div>
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>

              <!-- Mock Mobile App -->
              <div class="bg-gray-800 rounded-3xl overflow-hidden shadow-xl max-w-sm mx-auto">
                <!-- Phone Header -->
                <div class="flex items-center justify-center px-4 py-2 bg-gray-900">
                  <div class="w-16 h-1 bg-gray-600 rounded-full"></div>
                </div>

                <!-- App Content -->
                <div class="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-96">
                  <!-- App Header -->
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <h4 class="text-lg font-bold text-gray-800">{{ greeting }},</h4>
                      <p class="text-gray-600">{{ displayName }}</p>
                    </div>
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        v-if="user?.picture" 
                        :src="user.picture" 
                        :alt="user.name"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      >
                      <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  </div>

                  <!-- Balance Card -->
                  <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                    <div class="text-sm opacity-90 mb-2">Total Saldo</div>
                    <div class="text-3xl font-bold mb-4">{{ formatCurrency(displayBalance) }}</div>
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs opacity-90">Keuntungan Hari Ini</div>
                        <div class="text-green-300 font-semibold">+{{ formatCurrency(dailyProfit) }}</div>
                      </div>
                      <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Actions -->
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <button 
                      @click="handleTopUp"
                      class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div class="text-gray-800 font-semibold text-sm">Top Up</div>
                      <div class="text-gray-500 text-xs">Isi saldo</div>
                    </button>
                    <button 
                      @click="handleTransfer"
                      class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"></path>
                        </svg>
                      </div>
                      <div class="text-gray-800 font-semibold text-sm">Transfer</div>
                      <div class="text-gray-500 text-xs">Kirim uang</div>
                    </button>
                  </div>

                  <!-- Investment Portfolio -->
                  <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                      <div class="text-gray-800 font-semibold">Portfolio Investasi</div>
                      <div class="text-green-500 text-sm font-medium">+{{ portfolioGrowth }}%</div>
                    </div>
                    <div class="space-y-2">
                      <div 
                        v-for="investment in investments" 
                        :key="investment.id"
                        class="flex justify-between items-center py-2"
                      >
                        <div class="flex items-center space-x-3">
                          <div :class="`w-8 h-8 ${investment.color} rounded-full`"></div>
                          <div>
                            <div class="text-sm font-medium text-gray-800">{{ investment.name }}</div>
                            <div class="text-xs text-gray-500">{{ investment.detail }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm font-medium text-gray-800">{{ formatCurrency(investment.value) }}</div>
                          <div class="text-xs text-green-500">+{{ investment.growth }}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Feature Tags -->
              <div class="flex flex-wrap gap-2 mt-6">
                <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">Digital Payment</span>
                <span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">Investment</span>
                <span class="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">Banking</span>
                <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">Insurance</span>
              </div>
            </div>

            <!-- Floating Secondary Cards -->
            <div class="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-white/20 floating-card-slow flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>

            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-white/20 floating-card-reverse flex items-center justify-center">
              <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="mt-20 text-center">
        <p class="text-gray-400 mb-8">Layanan Unggulan Kami</p>
        <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <!-- Dynamic Services -->
          <div 
            v-for="service in services" 
            :key="service.id"
            @click="handleServiceClick(service)"
            class="flex items-center space-x-2 tech-item cursor-pointer"
          >
            <svg :class="`w-8 h-8 ${service.color}`" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon"></path>
            </svg>
            <span class="text-white font-medium">{{ service.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-30">
      <p>{{ error }}</p>
      <button @click="error = null" class="ml-2 text-white/80 hover:text-white">×</button>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Type definitions
interface User {
  id: string
  name: string
  email: string
  picture?: string
  balance: number
  created_at: string
  updated_at: string
}

interface Investment {
  id: number
  name: string
  detail: string
  value: number
  growth: number
  color: string
}

interface Service {
  id: number
  name: string
  color: string
  icon: string
}

interface Stats {
  activeUsers: number
  totalTransactions: number
  uptime: number
}

interface ProfileComposable {
  user: ReturnType<typeof ref<User | null>>
  error: ReturnType<typeof ref<string | null>>
  isLoading: ReturnType<typeof ref<boolean>>
  fetchProfile: () => Promise<void>
}

// Mock composable since the original might not be available
const useProfile = (): ProfileComposable => {
  const user = ref<User | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const fetchProfile = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - replace with actual API call
      const mockUser: User = {
        id: '12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        balance: 15750000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      user.value = mockUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat profil'
      console.error('Profile fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    error,
    isLoading,
    fetchProfile
  }
}

// Reactive data
const isVisible = ref(false)
const { user, error, isLoading, fetchProfile } = useProfile()

// Computed properties with proper typing
const greeting = computed((): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang' 
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

const displayName = computed((): string => {
  return user.value?.name || 'Pengguna'
})

const displayBalance = computed((): number => {
  return user.value?.balance || 0
})

const dailyProfit = computed((): number => {
  // Calculate 0.5% of balance as daily profit
  return Math.floor((displayBalance.value * 0.005))
})

const portfolioGrowth = computed((): string => {
  return '8.5'
})

// Static data with proper typing
const stats = ref<Stats>({
  activeUsers: 2000000,
  totalTransactions: 50000000000000, // 50T
  uptime: 99.9
})

const investments = ref<Investment[]>([
  {
    id: 1,
    name: 'Emas',
    detail: '2.5 gram',
    value: 2100000,
    growth: 2.1,
    color: 'bg-yellow-400'
  },
  {
    id: 2,
    name: 'Saham',
    detail: 'Mixed Portfolio',
    value: 5200000,
    growth: 12.3,
    color: 'bg-blue-500'
  },
  {
    id: 3,
    name: 'Obligasi',
    detail: 'Pemerintah',
    value: 3150000,
    growth: 5.8,
    color: 'bg-green-500'
  }
])

const services = ref<Service[]>([
  {
    id: 1,
    name: 'Digital Wallet',
    color: 'text-blue-400',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    id: 2,
    name: 'Investasi',
    color: 'text-green-400',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    id: 3,
    name: 'Digital Banking',
    color: 'text-cyan-400',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  },
  {
    id: 4,
    name: 'Asuransi',
    color: 'text-purple-400',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    id: 5,
    name: 'Pinjaman',
    color: 'text-yellow-400',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
  }
])

// Methods with proper typing
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000000) { // Triliun
    return `Rp${(amount / 1000000000000).toFixed(0)}T`
  } else if (amount >= 1000000000) { // Miliar  
    return `Rp${(amount / 1000000000).toFixed(1)}M`
  } else if (amount >= 1000000) { // Juta
    return `Rp${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) { // Ribu
    return `Rp${(amount / 1000).toFixed(0)}K`
  }
  return `Rp${amount.toLocaleString('id-ID')}`
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`
  }
  return num.toString()
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

const handleInvestment = (): void => {
  if (user.value) {
    // Navigate to investment page
    console.log('Navigate to investment page for user:', user.value.id)
    // Example: await navigateTo('/investment')
  } else {
    // Navigate to login/register
    console.log('Navigate to login page')
    // Example: await navigateTo('/login')
  }
}

const handleContact = (): void => {
  console.log('Open contact modal or navigate to contact page')
  // Example: showContactModal.value = true
}

const handleTopUp = (): void => {
  console.log('Open top-up modal')
  // Example: showTopUpModal.value = true
}

const handleTransfer = (): void => {
  console.log('Open transfer modal')
  // Example: showTransferModal.value = true
}

const handleServiceClick = (service: Service): void => {
  console.log('Navigate to service:', service.name)
  // Example: await navigateTo(`/services/${service.id}`)
}

// Auto-refresh profile data
let profileRefreshInterval: ReturnType<typeof setInterval> | null = null

// Lifecycle hooks
onMounted(async (): Promise<void> => {
  isVisible.value = true
  await fetchProfile()
  
  // Set up auto-refresh every 30 seconds
  profileRefreshInterval = setInterval(() => {
    if (!isLoading.value) {
      fetchProfile()
    }
  }, 30000)
})

onUnmounted((): void => {
  if (profileRefreshInterval) {
    clearInterval(profileRefreshInterval)
    profileRefreshInterval = null
  }
})
</script>
<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(2deg); }
  66% { transform: translateY(-10px) rotate(-1deg); }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes floatReverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(15px) rotate(-2deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.floating-card {
  animation: float 6s ease-in-out infinite;
  transition: all 0.3s ease;
}

.floating-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.floating-card-slow {
  animation: floatSlow 8s ease-in-out infinite;
}

.floating-card-reverse {
  animation: floatReverse 7s ease-in-out infinite;
}

.tech-item {
  transition: all 0.3s ease;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.tech-item:hover {
  transform: translateY(-5px) scale(1.05);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
}

/* Particle animations */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  opacity: 0.6;
  animation: sparkle 3s infinite;
}

.particle-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
  animation-duration: 3s;
}

.particle-2 {
  top: 60%;
  left: 80%;
  animation-delay: 1s;
  animation-duration: 4s;
}

.particle-3 {
  top: 30%;
  left: 70%;
  animation-delay: 2s;
  animation-duration: 3.5s;
}

.particle-4 {
  top: 80%;
  left: 20%;
  animation-delay: 0.5s;
  animation-duration: 4.5s;
}

.particle-5 {
  top: 50%;
  left: 50%;
  animation-delay: 1.5s;
  animation-duration: 3.2s;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #06b6d4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2563eb, #0891b2);
}

/* Enhanced button effects */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
  z-index: 1;
}

button:hover::before {
  left: 100%;
}

button:active {
  transform: scale(0.98);
}

/* Responsive improvements */
@media (max-width: 768px) {
  .floating-card {
    margin: 0 auto;
    max-width: 90%;
  }
  
  .particle {
    display: none; /* Hide particles on mobile for performance */
  }
  
  .tech-item {
    padding: 8px 12px;
    font-size: 14px;
  }
}

/* Loading spinner enhancement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Enhanced gradient text animation */
.bg-clip-text {
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
}

/* Glassmorphism effects */
.backdrop-blur-lg {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Enhanced shadow effects */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom animations for stats */
.stats-counter {
  animation: fadeInUp 1s ease-out;
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease;
}

/* Focus states for accessibility */
button:focus,
.tech-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  h1 {
    font-size: 2.5rem;
    line-height: 1.1;
  }
  
  .grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
  }
  
  .flex-col.sm\:flex-row {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .bg-gradient-to-br {
    background: linear-gradient(to bottom right, #0f172a, #1e40af, #0f172a);
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduce-motion: reduce) {
  .floating-card,
  .floating-card-slow,
  .floating-card-reverse,
  .particle,
  .animate-pulse,
  .animate-bounce {
    animation: none;
  }
  
  .tech-item:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .text-gray-300,
  .text-gray-400,
  .text-gray-500 {
    color: #ffffff;
  }
  
  .border-white\/20,
  .border-white\/30 {
    border-color: #ffffff;
  }
}
</style>