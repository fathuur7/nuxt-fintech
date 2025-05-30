<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
    </div>

    <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md">
        <!-- Logo and Brand -->
        <div class="text-center mb-8 animate-float">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">FinanceFlow</h1>
          <p class="text-gray-300">Your Smart Financial Partner</p>
        </div>

        <!-- Multiple Animated Container Options -->
        
        <!-- Option 1: Rotating Gradient Border -->
        <div class="relative group mb-8">
          <!-- Rotating gradient border -->
          <div class="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-blue-500 via-purple-600 to-pink-500 rounded-3xl blur-sm opacity-40 group-hover:opacity-70 animate-spin-slow"></div>
          
          <!-- Inner glow -->
          <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-400/50 via-blue-500/50 to-purple-600/50 rounded-3xl animate-pulse-glow"></div>
          
          <!-- Corner decorations -->
          <div class="absolute -top-3 -left-3 w-6 h-6 border-2 border-emerald-400 rounded-full animate-orbit"></div>
          <div class="absolute -top-3 -right-3 w-4 h-4 border-2 border-blue-400 rounded-full animate-orbit-reverse delay-500"></div>
          <div class="absolute -bottom-3 -left-3 w-5 h-5 border-2 border-purple-400 rounded-full animate-orbit delay-1000"></div>
          <div class="absolute -bottom-3 -right-3 w-3 h-3 border-2 border-pink-400 rounded-full animate-orbit-reverse delay-1500"></div>
          
          <!-- Traveling dots -->
          <div class="absolute inset-0 rounded-3xl overflow-hidden">
            <div class="absolute w-2 h-2 bg-emerald-400 rounded-full animate-travel-border"></div>
            <div class="absolute w-2 h-2 bg-blue-400 rounded-full animate-travel-border-reverse delay-2000"></div>
          </div>

          <!-- Main card content -->
          <div class="relative bg-slate-900/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            
            <!-- Content header -->
            <div class="text-center mb-8">
              <h2 class="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
              <p class="text-gray-300">Sign in to manage your finances</p>
            </div>

            <!-- Animated feature grid -->
            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="text-center group">
                <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/30">
                  <svg class="w-6 h-6 text-emerald-400 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <p class="text-xs text-gray-300">Secure</p>
              </div>
              <div class="text-center group">
                <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/30">
                  <svg class="w-6 h-6 text-blue-400 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <p class="text-xs text-gray-300">Analytics</p>
              </div>
              <div class="text-center group">
                <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/30">
                  <svg class="w-6 h-6 text-purple-400 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <p class="text-xs text-gray-300">Fast</p>
              </div>
            </div>

            <!-- Animated Google Login Button -->
            <button
              @click="loginWithGoogle"
              class="relative w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg group overflow-hidden"
            >
              <!-- Button shine effect -->
              <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <svg class="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="relative z-10">Continue with Google</span>
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Animated trust indicators -->
            <div class="mt-6 pt-6 border-t border-white/10">
              <div class="flex items-center justify-center space-x-6 text-xs text-gray-400">
                <div class="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                  <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span>256-bit SSL</span>
                </div>
                <div class="flex items-center space-x-1 hover:text-green-400 transition-colors">
                  <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Bank-level Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-gray-400 text-sm">
          <p>By continuing, you agree to our</p>
          <div class="flex justify-center space-x-4 mt-2">
            <a href="#" class="hover:text-white transition-colors hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#" class="hover:text-white transition-colors hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { loginWithGoogle } = useAuth()

definePageMeta({
  layout: false,
  auth: false
})
</script>

<style>
/* Enhanced animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.02);
  }
}

@keyframes orbit {
  0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
}

@keyframes orbit-reverse {
  0% { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
  100% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
}

@keyframes travel-border {
  0% {
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
  }
  25% {
    top: 50%;
    right: -2px;
    left: auto;
    transform: translateY(-50%);
  }
  50% {
    bottom: -2px;
    right: 50%;
    top: auto;
    transform: translateX(50%);
  }
  75% {
    bottom: 50%;
    left: -2px;
    right: auto;
    transform: translateY(50%);
  }
  100% {
    top: -2px;
    left: 50%;
    bottom: auto;
    transform: translateX(-50%);
  }
}

@keyframes travel-border-reverse {
  0% {
    bottom: -2px;
    right: 50%;
    transform: translateX(50%);
  }
  25% {
    right: 50%;
    left: -2px;
    bottom: auto;
    transform: translateY(-50%);
  }
  50% {
    top: -2px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
  75% {
    top: 50%;
    right: -2px;
    left: auto;
    transform: translateY(50%);
  }
  100% {
    bottom: -2px;
    right: 50%;
    top: auto;
    transform: translateX(50%);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Apply animations */
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-spin-slow { animation: spin-slow 8s linear infinite; }
.animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
.animate-orbit { animation: orbit 8s linear infinite; }
.animate-orbit-reverse { animation: orbit-reverse 6s linear infinite; }
.animate-travel-border { animation: travel-border 4s linear infinite; }
.animate-travel-border-reverse { animation: travel-border-reverse 4s linear infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }

/* Delay utilities */
.delay-300 { animation-delay: 0.3s; }
.delay-500 { animation-delay: 0.5s; }
.delay-1000 { animation-delay: 1s; }
.delay-1500 { animation-delay: 1.5s; }
.delay-2000 { animation-delay: 2s; }
</style>