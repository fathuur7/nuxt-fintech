<template>
  <section class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        v-for="(element, index) in backgroundElements" 
        :key="index"
        :class="element.classes"
        :style="{ 
          animationDelay: element.delay,
          top: element.top,
          left: element.left,
          right: element.right,
          bottom: element.bottom
        }"
      ></div>
      
      <!-- Dynamic Floating Particles -->
      <div class="absolute inset-0">
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle"
          :style="{ 
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration
          }"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-6 py-20">
      <div class="flex flex-col lg:flex-row items-center justify-between min-h-screen">
        
        <!-- Left Content -->
        <div 
          class="flex-1 text-white space-y-8 lg:pr-12"
          :class="{ 'animate-fade-in-up': isLoaded }"
        >
          <!-- Dynamic Badge -->
          <div 
            class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm cursor-pointer hover:bg-white/20 transition-all duration-300"
            @click="cycleBadgeText"
          >
            <svg class="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-green-400 font-medium transition-all duration-500">{{ currentBadge }}</span>
          </div>

          <!-- Animated Main Heading -->
          <div class="space-y-4">
            <h1 class="text-5xl lg:text-7xl font-bold leading-tight">
              <span 
                v-for="(line, index) in heroLines" 
                :key="index"
                class="block transition-all duration-1000"
                :class="line.classes"
                :style="{ transitionDelay: `${index * 200}ms` }"
              >
                {{ line.text }}
              </span>
            </h1>
            
            <p 
              class="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed transition-all duration-1000"
              :style="{ transitionDelay: '600ms' }"
            >
              {{ heroDescription }}
            </p>
          </div>

          <!-- Interactive CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              @click="handleInvestClick"
              @mouseenter="playHoverSound"
              class="group bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="flex items-center justify-center relative z-10">
                <svg 
                  class="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" 
                  :class="{ 'animate-spin': isInvestLoading }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                {{ isInvestLoading ? 'Memproses...' : 'Mulai Investasi' }}
              </span>
            </button>
            
            <button 
              @click="handleContactClick"
              @mouseenter="playHoverSound"
              class="group border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="flex items-center justify-center relative z-10">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Hubungi Kami
              </span>
            </button>
          </div>

          <!-- Dynamic Stats with Counter Animation -->
          <div class="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div 
              v-for="stat in stats" 
              :key="stat.id"
              class="text-center cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="animateStat(stat.id)"
            >
              <div 
                class="text-3xl font-bold transition-all duration-1000"
                :class="stat.color"
              >
                {{ stat.animatedValue }}
              </div>
              <div class="text-sm text-gray-400">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Right Content - Interactive App Showcase -->
        <div class="flex-1 lg:pl-12 mt-12 lg:mt-0">
          <div class="relative">
            <!-- Main App Card with Interactive Elements -->
            <div 
              class="floating-card backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl cursor-pointer"
              @click="toggleAppDemo"
              @mouseenter="startAppAnimation"
              @mouseleave="stopAppAnimation"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-xl font-bold text-white">{{ appData.title }}</h3>
                  <p class="text-blue-300">{{ appData.subtitle }}</p>
                </div>
                <div 
                  class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center transition-transform duration-300"
                  :class="{ 'rotate-12 scale-110': isAppAnimating }"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>

              <!-- Mock Mobile App with Dynamic Content -->
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
                      <h4 class="text-lg font-bold text-gray-800">{{ appData.greeting }}</h4>
                      <p class="text-gray-600">{{ appData.username }}</p>
                    </div>
                    <div 
                      class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                      @click.stop="toggleNotifications"
                    >
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 4h7a2 2 0 012 2v6"></path>
                      </svg>
                      <span 
                        v-if="hasNotifications" 
                        class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
                      ></span>
                    </div>
                  </div>

                  <!-- Dynamic Balance Card -->
                  <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div class="text-sm opacity-90 mb-2">Total Saldo</div>
                    <div class="text-3xl font-bold mb-4">{{ formatCurrency(balance.total) }}</div>
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs opacity-90">Keuntungan Hari Ini</div>
                        <div 
                          class="font-semibold transition-all duration-500"
                          :class="balance.todayProfit >= 0 ? 'text-green-300' : 'text-red-300'"
                        >
                          {{ balance.todayProfit >= 0 ? '+' : '' }}{{ formatCurrency(balance.todayProfit) }}
                        </div>
                      </div>
                      <div 
                        class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                        @click.stop="refreshBalance"
                      >
                        <svg 
                          class="w-4 h-4 transition-transform duration-300"
                          :class="{ 'rotate-180': isBalanceRefreshing }"
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Interactive Quick Actions -->
                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      v-for="action in quickActions" 
                      :key="action.id"
                      class="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      @click="handleQuickAction(action.id)"
                    >
                      <div 
                        class="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                        :class="action.bgColor"
                      >
                        <svg 
                          class="w-5 h-5"
                          :class="action.iconColor"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.iconPath"></path>
                        </svg>
                      </div>
                      <div class="text-gray-800 font-semibold text-sm">{{ action.title }}</div>
                      <div class="text-gray-500 text-xs">{{ action.subtitle }}</div>
                    </div>
                  </div>

                  <!-- Dynamic Investment Portfolio -->
                  <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                      <div class="text-gray-800 font-semibold">Portfolio Investasi</div>
                      <div 
                        class="text-sm font-medium transition-all duration-500"
                        :class="portfolioGrowth >= 0 ? 'text-green-500' : 'text-red-500'"
                      >
                        {{ portfolioGrowth >= 0 ? '+' : '' }}{{ portfolioGrowth.toFixed(1) }}%
                      </div>
                    </div>
                    <div class="space-y-2">
                      <div 
                        v-for="investment in investments" 
                        :key="investment.id"
                        class="flex justify-between items-center py-2 hover:bg-gray-50 rounded px-2 cursor-pointer transition-colors"
                        @click="selectInvestment(investment.id)"
                      >
                        <div class="flex items-center space-x-3">
                          <div 
                            class="w-8 h-8 rounded-full transition-transform hover:scale-110"
                            :class="investment.color"
                          ></div>
                          <div>
                            <div class="text-sm font-medium text-gray-800">{{ investment.name }}</div>
                            <div class="text-xs text-gray-500">{{ investment.amount }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm font-medium text-gray-800">{{ formatCurrency(investment.value) }}</div>
                          <div 
                            class="text-xs transition-colors"
                            :class="investment.growth >= 0 ? 'text-green-500' : 'text-red-500'"
                          >
                            {{ investment.growth >= 0 ? '+' : '' }}{{ investment.growth.toFixed(1) }}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dynamic Feature Tags -->
              <div class="flex flex-wrap gap-2 mt-6">
                <span 
                  v-for="feature in features" 
                  :key="feature.id"
                  class="px-3 py-1 rounded-full text-sm border cursor-pointer hover:scale-105 transition-all duration-300"
                  :class="feature.classes"
                  @click="toggleFeature(feature.id)"
                >
                  {{ feature.name }}
                </span>
              </div>
            </div>

            <!-- Dynamic Floating Secondary Cards -->
            <div 
              v-for="floatingCard in floatingCards" 
              :key="floatingCard.id"
              class="absolute backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300"
              :class="[floatingCard.classes, floatingCard.animation]"
              :style="floatingCard.position"
              @click="handleFloatingCardClick(floatingCard.id)"
            >
              <svg 
                class="text-blue-300"
                :class="floatingCard.iconSize"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="floatingCard.iconPath"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic Services Section -->
      <div class="mt-20 text-center">
        <p class="text-gray-400 mb-8">{{ servicesTitle }}</p>
        <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div 
            v-for="service in services" 
            :key="service.id"
            class="flex items-center space-x-2 tech-item cursor-pointer"
            @click="selectService(service.id)"
            @mouseenter="playHoverSound"
          >
            <svg 
              class="w-8 h-8 transition-all duration-300"
              :class="[service.color, { 'scale-125': selectedService === service.id }]"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.iconPath"></path>
            </svg>
            <span 
              class="text-white font-medium transition-all duration-300"
              :class="{ 'text-blue-300 font-bold': selectedService === service.id }"
            >
              {{ service.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Scroll Indicator -->
    <div 
      class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform"
      @click="scrollToNext"
    >
      <svg class="w-6 h-6 text-white/60 hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>

    <!-- Notification Toast -->
    <Transition name="slide-up">
      <div 
        v-if="showToast"
        class="fixed bottom-4 right-4 bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-xl border border-white/30 shadow-2xl z-50"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'

// State Management
const isLoaded = ref(false)
const isInvestLoading = ref(false)
const isAppAnimating = ref(false)
const isBalanceRefreshing = ref(false)
const hasNotifications = ref(true)
const selectedService = ref(null)
const showToast = ref(false)
const toastMessage = ref('')

// Dynamic Content Data
const badges = ['Fintech Terpercaya 2025', 'Platform Digital #1', 'Inovasi Keuangan', 'Teknologi Terdepan']
const currentBadge = ref(badges[0])
let badgeIndex = 0

const heroLines = reactive([
  { text: 'Revolusi', classes: 'bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent' },
  { text: 'Keuangan Digital', classes: 'bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent' },
  { text: 'Indonesia', classes: 'text-white' }
])

const heroDescription = ref('Platform fintech terdepan yang menghadirkan solusi pembayaran digital, investasi, dan layanan keuangan inovatif untuk semua kalangan.')

// Dynamic Background Elements
const backgroundElements = reactive([
  {
    classes: 'absolute w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse',
    delay: '0s',
    top: '-10rem',
    right: '-10rem'
  },
  {
    classes: 'absolute w-64 h-64 bg-green-500 rounded-full opacity-15 animate-bounce slow',
    delay: '1s',
    top: '50%',
    left: '-8rem'
  },
  {
    classes: 'absolute w-48 h-48 bg-cyan-500 rounded-full opacity-20 animate-pulse',
    delay: '2s',
    bottom: '25%',
    right: '25%'
  }
])

// Dynamic Particles
const particles = reactive([])

// Stats with Animation
const stats = reactive([
  { 
    id: 1, 
    value: 2000000, 
    animatedValue: '0', 
    label: 'Pengguna Aktif', 
    color: 'text-blue-400',
    suffix: 'M+'
  },
  { 
    id: 2, 
    value: 50000000000000, 
    animatedValue: '0', 
    label: 'Transaksi Diproses', 
    color: 'text-cyan-400',
    prefix: 'Rp',
    suffix: 'T+'
  },
  { 
    id: 3, 
    value: 99.9, 
    animatedValue: '0', 
    label: 'Uptime Platform', 
    color: 'text-green-400',
    suffix: '%',
    decimal: 1
  }
])

// App Data
const appData = reactive({
  title: 'FinanceFlow App',
  subtitle: 'Dashboard Keuangan',
  greeting: 'Selamat Pagi,',
  username: 'Budi Santoso'
})

// Balance Data
const balance = reactive({
  total: 25450000,
  todayProfit: 125000
})

// Quick Actions
const quickActions = reactive([
  {
    id: 'topup',
    title: 'Top Up',
    subtitle: 'Isi saldo',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    iconPath: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
  },
  {
    id: 'transfer',
    title: 'Transfer',
    subtitle: 'Kirim uang',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    iconPath: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4'
  }
])

// Investment Portfolio
const investments = reactive([
  {
    id: 1,
    name: 'Emas',
    amount: '2.5 gram',
    value: 2100000,
    growth: 2.1,
    color: 'bg-yellow-400'
  },
  {
    id: 2,
    name: 'Saham',
    amount: 'Mixed',
    value: 5200000,
    growth: 12.3,
    color: 'bg-blue-500'
  }
])

const portfolioGrowth = computed(() => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0)
  const totalGrowth = investments.reduce((sum, inv) => sum + (inv.value * inv.growth / 100), 0)
  return (totalGrowth / totalValue) * 100
})

// Features
const features = reactive([
  {
    id: 1,
    name: 'Digital Payment',
    classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    active: true
  },
  {
    id: 2,
    name: 'Investment',
    classes: 'bg-green-500/20 text-green-300 border-green-500/30',
    active: false
  },
  {
    id: 3,
    name: 'Banking',
    classes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    active: false
  },
  {
    id: 4,
    name: 'Insurance',
    classes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    active: false
  }
])

// Floating Cards
const floatingCards = reactive([
  {
    id: 1,
    classes: 'w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    animation: 'floating-card-slow',
    position: { top: '-1rem', right: '-1rem' },
    iconSize: 'w-8 h-8',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    id: 2,
    classes: 'w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20',
    animation: 'floating-card-reverse',
    position: { bottom: '-1rem', left: '-1rem' },
    iconSize: 'w-6 h-6',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  }
])

// Services
const servicesTitle = ref('Layanan Unggulan Kami')
const services = reactive([
  {
    id: 1,
    name: 'Digital Wallet',
    color: 'text-blue-400',
    iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    id: 2,
    name: 'Investasi',
    color: 'text-green-400',
    iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    id: 3,
    name: 'Digital Banking',
    color: 'text-cyan-400',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  },
  {
    id: 4,
    name: 'Asuransi',
    color: 'text-purple-400',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    id: 5,
    name: 'Pinjaman',
    color: 'text-yellow-400',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
  }
])

// Methods
const cycleBadgeText = () => {
  badgeIndex = (badgeIndex + 1) % badges.length
  currentBadge.value = badges[badgeIndex]
  showToast.value = true
  toastMessage.value = `Switched to: ${currentBadge.value}`
  setTimeout(() => showToast.value = false, 2000)
}

const handleInvestClick = async () => {
  isInvestLoading.value = true
  playClickSound()
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isInvestLoading.value = false
  showToast.value = true
  toastMessage.value = 'Redirecting to investment platform...'
  setTimeout(() => showToast.value = false, 3000)
  
  // In real app, use: await navigateTo('/invest')
}

const handleContactClick = () => {
  playClickSound()
  showToast.value = true
  toastMessage.value = 'Opening chat...'
  setTimeout(() => showToast.value = false, 2000)
  // In real app, use: await navigateTo('/chat')
  useRouter().push('/chat')
  // In real app, use: await navigateTo('/contact')
}

const animateStat = (statId) => {
  const stat = stats.find(s => s.id === statId)
  if (!stat) return
  
  playClickSound()
  
  // Reset and animate counter
  let current = 0
  const target = stat.value
  const increment = target / 100
  const duration = 2000
  const stepTime = duration / 100
  
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    
    if (stat.id === 1) {
      stat.animatedValue = (current / 1000000).toFixed(1) + 'M+'
    } else if (stat.id === 2) {
      stat.animatedValue = 'Rp' + (current / 1000000000000).toFixed(0) + 'T+'
    } else if (stat.id === 3) {
      stat.animatedValue = current.toFixed(1) + '%'
    }
  }, stepTime)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const toggleAppDemo = () => {
  playClickSound()
  showToast.value = true
  toastMessage.value = 'App demo activated!'
  setTimeout(() => showToast.value = false, 2000)
}

const startAppAnimation = () => {
  isAppAnimating.value = true
}

const stopAppAnimation = () => {
  isAppAnimating.value = false
}

const toggleNotifications = () => {
  hasNotifications.value = !hasNotifications.value
  playClickSound()
  showToast.value = true
  toastMessage.value = hasNotifications.value ? 'Notifications enabled' : 'Notifications disabled'
  setTimeout(() => showToast.value = false, 2000)
}

const refreshBalance = async () => {
  isBalanceRefreshing.value = true
  playClickSound()
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Update balance with random changes
  const change = Math.floor(Math.random() * 100000) - 50000
  balance.todayProfit += change
  balance.total += change
  
  isBalanceRefreshing.value = false
  showToast.value = true
  toastMessage.value = 'Balance updated!'
  setTimeout(() => showToast.value = false, 2000)
}

const handleQuickAction = (actionId) => {
  const action = quickActions.find(a => a.id === actionId)
  playClickSound()
  showToast.value = true
  toastMessage.value = `${action.title} feature activated!`
  setTimeout(() => showToast.value = false, 2000)
}

const selectInvestment = (investmentId) => {
  const investment = investments.find(i => i.id === investmentId)
  playClickSound()
  showToast.value = true
  toastMessage.value = `Selected ${investment.name} investment`
  setTimeout(() => showToast.value = false, 2000)
}

const toggleFeature = (featureId) => {
  const feature = features.find(f => f.id === featureId)
  feature.active = !feature.active
  playClickSound()
  
  if (feature.active) {
    feature.classes = feature.classes.replace('opacity-50', '')
  } else {
    feature.classes += ' opacity-50'
  }
  
  showToast.value = true
  toastMessage.value = `${feature.name} ${feature.active ? 'enabled' : 'disabled'}`
  setTimeout(() => showToast.value = false, 2000)
}

const handleFloatingCardClick = (cardId) => {
  playClickSound()
  showToast.value = true
  toastMessage.value = `Floating card ${cardId} clicked!`
  setTimeout(() => showToast.value = false, 2000)
}

const selectService = (serviceId) => {
  selectedService.value = serviceId === selectedService.value ? null : serviceId
  const service = services.find(s => s.id === serviceId)
  playClickSound()
  showToast.value = true
  toastMessage.value = `${service.name} service selected`
  setTimeout(() => showToast.value = false, 2000)
}

const scrollToNext = () => {
  window.scrollBy({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}

// Sound effects (placeholder functions)
const playHoverSound = () => {
  // In real app, implement actual sound playback
  // Example: new Audio('/sounds/hover.mp3').play()
}

const playClickSound = () => {
  // In real app, implement actual sound playback
  // Example: new Audio('/sounds/click.mp3').play()
}

// Generate particles
const generateParticles = () => {
  particles.splice(0) // Clear existing particles
  
  for (let i = 0; i < 8; i++) {
    particles.push({
      id: i,
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      delay: Math.random() * 15 + 's',
      duration: (Math.random() * 10 + 10) + 's'
    })
  }
}

// Initialize stats animation
const initializeStats = () => {
  stats.forEach(stat => {
    if (stat.id === 1) {
      stat.animatedValue = '2M+'
    } else if (stat.id === 2) {
      stat.animatedValue = 'Rp50T+'
    } else if (stat.id === 3) {
      stat.animatedValue = '99.9%'
    }
  })
}

// Auto-cycle badge text
const startBadgeCycle = () => {
  setInterval(() => {
    cycleBadgeText()
  }, 5000)
}

// Auto-update balance
const startBalanceUpdates = () => {
  setInterval(() => {
    const change = Math.floor(Math.random() * 10000) - 5000
    balance.todayProfit += change
    if (Math.abs(change) > 3000) {
      showToast.value = true
      toastMessage.value = `Balance updated: ${change >= 0 ? '+' : ''}${formatCurrency(change)}`
      setTimeout(() => showToast.value = false, 2000)
    }
  }, 30000) // Update every 30 seconds
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  
  // Initialize components
  generateParticles()
  initializeStats()
  
  // Start auto-features
  startBadgeCycle()
  startBalanceUpdates()
  
  // Trigger loaded animation
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
  
  // Animate stats on load
  setTimeout(() => {
    stats.forEach((stat, index) => {
      setTimeout(() => animateStat(stat.id), index * 500)
    })
  }, 1000)
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
  33% { transform: translateY(15px) rotate(-2deg); }
  66% { transform: translateY(8px) rotate(1deg); }
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-5px); }
  75% { transform: translateY(-30px) translateX(15px); }
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

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.floating-card {
  animation: float 6s ease-in-out infinite;
}

.floating-card-slow {
  animation: floatSlow 8s ease-in-out infinite;
  animation-delay: 1s;
}

.floating-card-reverse {
  animation: floatReverse 7s ease-in-out infinite;
  animation-delay: 2s;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particleFloat 15s ease-in-out infinite;
}

.tech-item {
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-item:hover {
  transform: translateY(-5px);
  opacity: 1 !important;
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
}

.slow {
  animation-duration: 8s;
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-7xl {
    font-size: 3rem;
  }
  
  .floating-card-slow,
  .floating-card-reverse {
    display: none;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
</style>