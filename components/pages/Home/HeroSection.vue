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
            <button class="group bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Mulai Investasi
              </span>
            </button>
            
            <button class="group border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Hubungi Kami
              </span>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-400">2M+</div>
              <div class="text-sm text-gray-400">Pengguna Aktif</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-cyan-400">Rp50T+</div>
              <div class="text-sm text-gray-400">Transaksi Diproses</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400">99.9%</div>
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
                      <h4 class="text-lg font-bold text-gray-800">Selamat Pagi,</h4>
                      <p class="text-gray-600">Budi Santoso</p>
                    </div>
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 4h7a2 2 0 012 2v6"></path>
                      </svg>
                    </div>
                  </div>

                  <!-- Balance Card -->
                  <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                    <div class="text-sm opacity-90 mb-2">Total Saldo</div>
                    <div class="text-3xl font-bold mb-4">Rp 25.450.000</div>
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-xs opacity-90">Keuntungan Hari Ini</div>
                        <div class="text-green-300 font-semibold">+Rp 125.000</div>
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
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                      </div>
                      <div class="text-gray-800 font-semibold text-sm">Top Up</div>
                      <div class="text-gray-500 text-xs">Isi saldo</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                      <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"></path>
                        </svg>
                      </div>
                      <div class="text-gray-800 font-semibold text-sm">Transfer</div>
                      <div class="text-gray-500 text-xs">Kirim uang</div>
                    </div>
                  </div>

                  <!-- Investment Portfolio -->
                  <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                      <div class="text-gray-800 font-semibold">Portfolio Investasi</div>
                      <div class="text-green-500 text-sm font-medium">+8.5%</div>
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center py-2">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-yellow-400 rounded-full"></div>
                          <div>
                            <div class="text-sm font-medium text-gray-800">Emas</div>
                            <div class="text-xs text-gray-500">2.5 gram</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm font-medium text-gray-800">Rp 2.1M</div>
                          <div class="text-xs text-green-500">+2.1%</div>
                        </div>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-blue-500 rounded-full"></div>
                          <div>
                            <div class="text-sm font-medium text-gray-800">Saham</div>
                            <div class="text-xs text-gray-500">Mixed</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm font-medium text-gray-800">Rp 5.2M</div>
                          <div class="text-xs text-green-500">+12.3%</div>
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
          <!-- Digital Payment -->
          <div class="flex items-center space-x-2 tech-item">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-white font-medium">Digital Wallet</span>
          </div>

          <!-- Investment -->
          <div class="flex items-center space-x-2 tech-item">
            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <span class="text-white font-medium">Investasi</span>
          </div>

          <!-- Banking -->
          <div class="flex items-center space-x-2 tech-item">
            <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <span class="text-white font-medium">Digital Banking</span>
          </div>

          <!-- Insurance -->
          <div class="flex items-center space-x-2 tech-item">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span class="text-white font-medium">Asuransi</span>
          </div>

          <!-- Loans -->
          <div class="flex items-center space-x-2 tech-item">
            <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <span class="text-white font-medium">Pinjaman</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </section>
</template>

<script setup>
// Animation control
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
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

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  left: 20%;
  animation-delay: 3s;
}

.particle-3 {
  top: 30%;
  right: 15%;
  animation-delay: 6s;
}

.particle-4 {
  bottom: 40%;
  left: 70%;
  animation-delay: 9s;
}

.particle-5 {
  bottom: 20%;
  right: 30%;
  animation-delay: 12s;
}

.tech-item {
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-item:hover {
  transform: translateY(-5px);
  opacity: 1 !important;
}

.slow {
  animation-duration: 8s;
}

.delay-1000 {
  animation-delay: 1s;
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .text-7xl {
    font-size: 3rem;
  }
}

/* Custom gradient text animation */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}
</style>