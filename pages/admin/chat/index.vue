<template>
  <main class="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
    <!-- Sidebar: Users List -->
    <aside class="w-80 flex-shrink-0 shadow-xl shadow-slate-900/5 bg-white/80 backdrop-blur-sm border-r border-slate-200/60">
      <UsersList />
    </aside>

    <!-- Main Chat Window -->
    <section class="flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative">
      <!-- Chat Header -->
      <div class="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 class="font-semibold text-slate-900">Select a conversation</h2>
            <p class="text-sm text-slate-500">Choose a chat to start messaging</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Empty Chat State -->
      <div class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div class="relative mb-8">
          <!-- Main illustration circle -->
          <div class="w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 rounded-full flex items-center justify-center relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-200/50 via-transparent to-purple-200/50"></div>
            <!-- Chat bubbles illustration -->
            <div class="relative z-10 flex items-center justify-center">
              <div class="absolute -top-2 -left-2 w-8 h-6 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-2xl opacity-60"></div>
              <div class="absolute top-1 right-0 w-6 h-5 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl opacity-80"></div>
              <svg class="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          
          <!-- Floating elements -->
          <div class="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-60 animate-pulse"></div>
          <div class="absolute -bottom-2 -left-6 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-40 animate-pulse" style="animation-delay: 1s;"></div>
        </div>
        
        <div class="max-w-md">
          <h3 class="text-2xl font-bold text-slate-900 mb-3">Welcome to your messages</h3>
          <p class="text-slate-600 mb-8 leading-relaxed">
            Select a conversation from the sidebar to start chatting with your contacts. 
            Your messages are end-to-end encrypted and secure.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105">
              Start New Chat
            </button>
            <button class="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md">
              Invite Friends
            </button>
          </div>
        </div>
        
        <!-- Feature highlights -->
        <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 class="font-semibold text-slate-900 mb-1">Secure</h4>
            <p class="text-sm text-slate-600">End-to-end encrypted messages</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 class="font-semibold text-slate-900 mb-1">Fast</h4>
            <p class="text-sm text-slate-600">Real-time message delivery</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 class="font-semibold text-slate-900 mb-1">Simple</h4>
            <p class="text-sm text-slate-600">Easy to use interface</p>
          </div>
        </div>
      </div>
      
      <!-- Background decoration -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-1/4 right-10 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-10 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- Chat User Detail Panel (Hidden by default, can be toggled) -->
    <!-- <aside class="w-80 flex-shrink-0 bg-slate-50/80 backdrop-blur-sm border-l border-slate-200/60 hidden xl:block">
      <div class="h-full flex flex-col">
        <div class="p-6 border-b border-slate-200/60">
          <h3 class="font-semibold text-slate-900">Contact Info</h3>
        </div>
        <div class="flex-1 p-6">
          <p class="text-slate-500 text-center">Select a user to view details</p>
        </div>
      </div>
    </aside> -->
  </main>
</template>

<script setup lang="ts">
import UsersList from '@/components/pages/Chat/UsersList.vue';

definePageMeta({
  title: 'Chat Users',
  layout: 'admin',
  middleware: 'auth',
});
</script>

<style scoped>
/* Custom animations for floating elements */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1.5s;
}
</style>