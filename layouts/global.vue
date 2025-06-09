<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
    <!-- Enhanced Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Aurora Effect -->
      <div class="absolute inset-0">
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
        <div class="aurora aurora-3"></div>
      </div>
      
      <!-- Floating Geometric Shapes with Glassmorphism -->
      <div class="absolute inset-0">
        <div class="floating-shape shape-1 absolute w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-xl backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-2 absolute w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-lg backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-3 absolute w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-2xl backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-4 absolute w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-teal-600/20 rounded-full blur-lg backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-5 absolute w-36 h-36 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-xl backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-6 absolute w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-md backdrop-blur-sm border border-white/10"></div>
        <div class="floating-shape shape-7 absolute w-44 h-44 bg-gradient-to-br from-violet-400/15 to-purple-600/15 rounded-full blur-3xl backdrop-blur-sm border border-white/5"></div>
        <div class="floating-shape shape-8 absolute w-52 h-52 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl backdrop-blur-sm border border-white/5"></div>
      </div>
      
      <!-- Animated Hexagon Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="hexagon-pattern"></div>
      </div>
      
      <!-- Flowing Light Streaks -->
      <div class="absolute inset-0">
        <div class="light-streak streak-1"></div>
        <div class="light-streak streak-2"></div>
        <div class="light-streak streak-3"></div>
        <div class="light-streak streak-4"></div>
      </div>
      
      <!-- Gradient Overlays with Enhanced Depth -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-purple-900/40"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-900/20 to-cyan-900/30"></div>
      
      <!-- Sparkle Effects -->
      <div class="absolute inset-0">
        <div class="sparkle sparkle-1"></div>
        <div class="sparkle sparkle-2"></div>
        <div class="sparkle sparkle-3"></div>
        <div class="sparkle sparkle-4"></div>
        <div class="sparkle sparkle-5"></div>
        <div class="sparkle sparkle-6"></div>
        <div class="sparkle sparkle-7"></div>
        <div class="sparkle sparkle-8"></div>
      </div>
    </div>

    <!-- Content Slot with Glass Container -->
    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Optional Glass Nav Bar -->
      <!-- <nav class="glass-nav p-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div class="container mx-auto">
          <slot name="nav" />
        </div>
      </nav> -->
      
      <!-- Main Content Area -->
      <main class="flex-1 container mx-auto px-4 py-8">
        <slot />
      </main>
      
      <!-- Optional Glass Footer -->
      <!-- <footer class="glass-footer p-4 backdrop-blur-xl bg-white/5 border-t border-white/10">
        <div class="container mx-auto">
          <slot name="footer" />
        </div>
      </footer> -->
    </div>
  </div>
</template>

<script setup>
// Layout script untuk Nuxt
import { onMounted } from 'vue'

onMounted(() => {
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth'
})
</script>

<style scoped>
.container {
    max-width: 1200px;
}

/* Aurora Effect */
.aurora {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  filter: blur(40px);
  animation: aurora 20s ease-in-out infinite;
}

.aurora-1 {
  background: linear-gradient(45deg, #00f5ff, #ff00ff, #00ff00);
  animation-delay: 0s;
}

.aurora-2 {
  background: linear-gradient(-45deg, #ff0080, #00ffff, #8000ff);
  animation-delay: -7s;
}

.aurora-3 {
  background: linear-gradient(90deg, #ff8000, #0080ff, #ff0040);
  animation-delay: -14s;
}

@keyframes aurora {
  0%, 100% {
    opacity: 0.2;
    transform: translateX(-50px) scale(1);
  }
  25% {
    opacity: 0.4;
    transform: translateX(50px) scale(1.1);
  }
  50% {
    opacity: 0.3;
    transform: translateX(0px) scale(0.9);
  }
  75% {
    opacity: 0.5;
    transform: translateX(-25px) scale(1.05);
  }
}

/* Enhanced Floating Shapes */
.floating-shape {
  animation: floatEnhanced 25s ease-in-out infinite;
  position: relative;
}

.floating-shape::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1));
  border-radius: inherit;
  z-index: -1;
  animation: shimmer 3s ease-in-out infinite;
}

.shape-1 {
  top: 5%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  top: 15%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  top: 55%;
  left: 8%;
  animation-delay: -10s;
}

.shape-4 {
  top: 75%;
  right: 15%;
  animation-delay: -15s;
}

.shape-5 {
  top: 35%;
  right: 5%;
  animation-delay: -7s;
}

.shape-6 {
  top: 65%;
  left: 55%;
  animation-delay: -12s;
}

.shape-7 {
  top: 25%;
  left: 40%;
  animation-delay: -20s;
}

.shape-8 {
  top: 85%;
  left: 25%;
  animation-delay: -25s;
}

@keyframes floatEnhanced {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-30px) rotate(5deg) scale(1.1);
  }
  50% {
    transform: translateY(-15px) rotate(-5deg) scale(0.95);
  }
  75% {
    transform: translateY(-45px) rotate(3deg) scale(1.05);
  }
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

/* Hexagon Pattern */
.hexagon-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 60px 60px;
  background-position: 0 0, 30px 30px;
  animation: hexagonMove 40s linear infinite;
  height: 100%;
  width: 100%;
}

@keyframes hexagonMove {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(60px, 60px) rotate(360deg);
  }
}

/* Light Streaks */
.light-streak {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent);
  animation: streak 8s ease-in-out infinite;
}

.streak-1 {
  top: 10%;
  left: 20%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.streak-2 {
  top: 30%;
  right: 25%;
  animation-delay: -2s;
  transform: rotate(-20deg);
}

.streak-3 {
  top: 60%;
  left: 70%;
  animation-delay: -4s;
  transform: rotate(10deg);
}

.streak-4 {
  top: 80%;
  right: 40%;
  animation-delay: -6s;
  transform: rotate(-15deg);
}

@keyframes streak {
  0%, 100% {
    opacity: 0;
    transform: translateY(0px) scaleY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-50px) scaleY(1);
  }
}

/* Sparkle Effects */
.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle 3s ease-in-out infinite;
}

.sparkle-1 { top: 20%; left: 15%; animation-delay: 0s; }
.sparkle-2 { top: 40%; right: 20%; animation-delay: -0.5s; }
.sparkle-3 { top: 60%; left: 80%; animation-delay: -1s; }
.sparkle-4 { top: 80%; right: 60%; animation-delay: -1.5s; }
.sparkle-5 { top: 10%; left: 60%; animation-delay: -2s; }
.sparkle-6 { top: 70%; left: 30%; animation-delay: -2.5s; }
.sparkle-7 { top: 50%; right: 10%; animation-delay: -1.2s; }
.sparkle-8 { top: 30%; left: 40%; animation-delay: -0.8s; }

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Glass Morphism Effects */
.glass-nav, .glass-footer {
  position: relative;
  overflow: hidden;
}

.glass-nav::before, .glass-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05));
  pointer-events: none;
}

/* Enhanced Animations */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 193, 7, 0.8), 0 0 60px rgba(255, 193, 7, 0.3);
  }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

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

@keyframes floatSoft {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-float {
  animation: floatSoft 4s ease-in-out infinite;
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2563eb, #7c3aed, #db2777);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .floating-shape {
    transform: scale(0.7);
  }
  
  .aurora {
    display: none;
  }
  
  .light-streak {
    display: none;
  }
}

@media (max-width: 480px) {
  .floating-shape {
    transform: scale(0.5);
  }
  
  .sparkle {
    display: none;
  }
}

/* Hover Effects */
.floating-shape:hover {
  animation-play-state: paused;
  transform: scale(1.2);
  transition: transform 0.3s ease;
}

/* Print Styles */
@media print {
  .aurora, .floating-shape, .light-streak, .sparkle {
    display: none;
  }
}
</style>